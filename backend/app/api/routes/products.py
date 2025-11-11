from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Literal
from fastapi import APIRouter, HTTPException, Depends, Query, Response
import unicodedata, re

from app.models.product import Product, ProductCreate, ProductUpdate
from app.db import SessionLocal, ProductDB, CategoryDB
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/products", tags=["products"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _normalize_name(value: str) -> str:
    s = value.strip().lower()
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


@router.get("", response_model=List[Product])
def list_products(
    response: Response,
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Buscar por nombre de producto"),
    sort: Literal["name", "price", "categoria"] = "name",
    order: Literal["asc", "desc"] = "asc",
    offset: int = 0,
    limit: int = Query(6, ge=1, le=100),
):
    """
    Lista productos con busqueda, ordenamiento (nombre, precio o categoria)
    y paginacion (offset / limit)
    """
    query = db.query(ProductDB).options(joinedload(ProductDB.category))

    if q:
        query = query.filter(ProductDB.name.ilike(f"%{q}%"))

    if sort == "categoria":
        query = query.join(CategoryDB).order_by(
            func.lower(CategoryDB.name).asc() if order == "asc" else func.lower(CategoryDB.name).desc()
        )
    else:
        field = getattr(ProductDB, sort)
        query = query.order_by(field.asc() if order == "asc" else field.desc())

    total = query.count()
    response.headers["X-Total-Count"] = str(total)

    products = query.offset(offset).limit(limit).all()
    return [Product.model_validate(p) for p in products]


@router.post("", response_model=Product, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    # Duplicado exacto (sin distinguir mayusculas/minusculas)
    existing = (
        db.query(ProductDB)
        .filter(func.lower(ProductDB.name) == func.lower(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Producto duplicado")

    # Casi duplicado segun clave normalizada
    new_key = _normalize_name(payload.name)
    for pid, pname in db.query(ProductDB.id, ProductDB.name).all():
        if _normalize_name(pname) == new_key:
            raise HTTPException(status_code=409, detail="Nombre muy parecido a uno existente")

    product = ProductDB(
        name=payload.name.strip(),
        price=payload.price,
        categoria_id=payload.categoria_id,
        supplier_id=payload.supplier_id,
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return Product.model_validate(product)


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Product.model_validate(product)


@router.put("/{product_id}", response_model=Product)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if payload.name:
        # Duplicado exacto
        name_exists = db.query(ProductDB).filter(
            func.lower(ProductDB.name) == func.lower(payload.name.strip()),
            ProductDB.id != product_id,
        ).first()
        if name_exists:
            raise HTTPException(status_code=409, detail="Ya existe otro producto con ese nombre")

        # Casi duplicado segun clave normalizada
        new_key = _normalize_name(payload.name)
        for pid, pname in db.query(ProductDB.id, ProductDB.name).filter(ProductDB.id != product_id).all():
            if _normalize_name(pname) == new_key:
                raise HTTPException(status_code=409, detail="Nombre muy parecido a uno existente")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return Product.model_validate(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    db.delete(product)
    db.commit()
    return None

