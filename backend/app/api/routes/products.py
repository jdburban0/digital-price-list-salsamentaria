from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Literal
from fastapi import APIRouter, HTTPException, Depends, Query, Response
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
    Lista productos con búsqueda, ordenamiento (nombre, precio o categoría)
    y paginación (offset / limit)
    """
    query = db.query(ProductDB).options(joinedload(ProductDB.category))

    # --- Búsqueda ---
    if q:
        query = query.filter(ProductDB.name.ilike(f"%{q}%"))

    # --- Ordenamiento ---
    if sort == "categoria":
        query = query.join(CategoryDB).order_by(
            func.lower(CategoryDB.name).asc()
            if order == "asc"
            else func.lower(CategoryDB.name).desc()
        )
    else:
        field = getattr(ProductDB, sort)
        query = query.order_by(field.asc() if order == "asc" else field.desc())

    # --- Paginación ---
    total = query.count()
    print("TOTAL DE PRODUCTOS:", total)  #para verificar en consola

    #asegura que se envíe la cabecera correctamente
    response.headers["X-Total-Count"] = str(total)

    products = query.offset(offset).limit(limit).all()
    return [Product.model_validate(p) for p in products]



# ------------------ CRUD PROTEGIDO ------------------
@router.post("", response_model=Product, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    existing = (
        db.query(ProductDB)
        .filter(func.lower(ProductDB.name) == func.lower(payload.name.strip()))
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Este producto ya está registrado")

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
        name_exists = db.query(ProductDB).filter(
            func.lower(ProductDB.name) == func.lower(payload.name.strip()),
            ProductDB.id != product_id,
        ).first()
        if name_exists:
            raise HTTPException(status_code=409, detail="Ya existe otro producto con ese nombre")

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

