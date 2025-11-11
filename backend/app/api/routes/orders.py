from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user
from app.db import CustomerDB, OrderDB, ProductDB, SessionLocal
from app.models.order import Order, OrderCreate, OrderUpdate

router = APIRouter(prefix="/orders", tags=["orders"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[Order])
def list_orders(
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
    customer_id: Optional[int] = Query(default=None, gt=0),
    status: Optional[str] = Query(default=None, min_length=2, max_length=50),
):
    query = db.query(OrderDB).options(
        joinedload(OrderDB.customer), joinedload(OrderDB.product)
    )

    if customer_id:
        query = query.filter(OrderDB.customer_id == customer_id)
    if status:
        query = query.filter(func.lower(OrderDB.status) == status.lower())

    orders = query.order_by(OrderDB.created_at.desc()).all()
    return [Order.model_validate(order) for order in orders]


@router.post("", response_model=Order, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    customer = db.query(CustomerDB).filter(CustomerDB.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    product = db.query(ProductDB).filter(ProductDB.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    order = OrderDB(
        customer_id=payload.customer_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        status=(payload.status or "pendiente").strip(),
        notes=payload.notes.strip() if payload.notes else None,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    db.refresh(order, attribute_names=["customer", "product"])
    return Order.model_validate(order)


@router.get("/{order_id}", response_model=Order)
def get_order(order_id: int, db: Session = Depends(get_db), _: None = Depends(get_current_user)):
    order = (
        db.query(OrderDB)
        .options(joinedload(OrderDB.customer), joinedload(OrderDB.product))
        .filter(OrderDB.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return Order.model_validate(order)


@router.put("/{order_id}", response_model=Order)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    update_data = payload.model_dump(exclude_unset=True)

    if "customer_id" in update_data:
        customer = db.query(CustomerDB).filter(CustomerDB.id == update_data["customer_id"]).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if "product_id" in update_data:
        product = db.query(ProductDB).filter(ProductDB.id == update_data["product_id"]).first()
        if not product:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

    for field, value in update_data.items():
        if field == "status" and value:
            setattr(order, field, value.strip())
        elif field == "notes" and value:
            setattr(order, field, value.strip())
        else:
            setattr(order, field, value)

    db.commit()
    db.refresh(order)
    db.refresh(order, attribute_names=["customer", "product"])
    return Order.model_validate(order)


@router.delete("/{order_id}", status_code=204)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    order = db.query(OrderDB).filter(OrderDB.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    db.delete(order)
    db.commit()
    return None
