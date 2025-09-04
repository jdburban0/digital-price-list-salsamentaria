from typing import Dict, List, Optional, Literal
from fastapi import APIRouter, HTTPException, Query, Response
from app.models.product import Product, ProductCreate, ProductUpdate  # pylint: disable=E0611,E0401

router = APIRouter(prefix="/products", tags=["products"])

# Almacenamiento en memoria
_db: Dict[int, Product] = {}
_next_id: int = 1


def _get_next_id() -> int:
    global _next_id  # pylint: disable=W0603
    nid = _next_id
    _next_id += 1
    return nid


@router.get("", response_model=List[Product])
def list_products(
    response: Response,
    q: Optional[str] = Query(
        None, description="Buscar por nombre del producto"),
    sort: Literal["name", "price"] = "name",
    order: Literal["asc", "desc"] = "asc",
    offset: int = Query(
        0, ge=0, description="Índice de inicio para paginación"),
    limit: int = Query(
        10, ge=1, le=100, description="Número máximo de productos a retornar")
) -> List[Product]:
    # 1) Copia de trabajo
    data = list(_db.values())

    # 2) Filtro por búsqueda
    if q:
        t = q.lower().strip()
        data = [p for p in data if t in (p.name or "").lower()]

    # 3) Ordenamiento
    def key_fn(p: Product):
        v = getattr(p, sort, None)
        return v.lower() if isinstance(v, str) else (v if v is not None else "")
    data.sort(key=key_fn, reverse=(order == "desc"))

    # 4) Total + paginación
    total = len(data)
    response.headers["X-Total-Count"] = str(total)
    return data[offset:offset + limit]


@router.post("", response_model=Product, status_code=201)
def create_product(payload: ProductCreate) -> Product:
    # Validar unicidad del nombre
    if any(p.name.lower() == payload.name.lower() for p in _db.values()):
        raise HTTPException(
            status_code=409, detail="Product name already exists")

    product = Product(id=_get_next_id(), **payload.dict())
    _db[product.id] = product
    return product


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int) -> Product:
    product = _db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=Product)
def update_product(product_id: int, payload: ProductUpdate) -> Product:
    product = _db.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Validar unicidad del nombre si se proporciona
    if payload.name and any(p.name.lower() == payload.name.lower() and p.id != product_id for p in _db.values()):
        raise HTTPException(
            status_code=409, detail="Product name already exists")

    update_data = payload.dict(exclude_unset=True)
    updated = product.copy(update=update_data)
    _db[product_id] = updated
    return updated


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int) -> None:
    if product_id not in _db:
        raise HTTPException(status_code=404, detail="Product not found")
    del _db[product_id]
    return None
