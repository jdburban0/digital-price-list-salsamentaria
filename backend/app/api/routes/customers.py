from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db import CustomerDB, OrderDB, SessionLocal
from app.models.customer import Customer, CustomerCreate, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[Customer])
def list_customers(db: Session = Depends(get_db)):
    return db.query(CustomerDB).order_by(CustomerDB.name.asc()).all()


@router.get("/{customer_id}", response_model=Customer)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(CustomerDB).filter(CustomerDB.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return customer


@router.post("", response_model=Customer, status_code=201)
def create_customer(
    payload: CustomerCreate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    email_exists = db.query(CustomerDB).filter(CustomerDB.email == payload.email).first()
    if email_exists:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    customer = CustomerDB(
        name=payload.name.strip(),
        email=payload.email,
        phone=payload.phone.strip() if payload.phone else None,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    customer = db.query(CustomerDB).filter(CustomerDB.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    if payload.email and payload.email != customer.email:
        email_exists = (
            db.query(CustomerDB)
            .filter(CustomerDB.email == payload.email, CustomerDB.id != customer_id)
            .first()
        )
        if email_exists:
            raise HTTPException(status_code=409, detail="El correo ya está registrado")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "name" and isinstance(value, str):
            setattr(customer, field, value.strip())
        elif field == "phone" and value:
            setattr(customer, field, value.strip())
        else:
            setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(get_current_user),
):
    customer = db.query(CustomerDB).filter(CustomerDB.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    has_orders = db.query(OrderDB).filter(OrderDB.customer_id == customer_id).count() > 0
    if has_orders:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el cliente porque tiene pedidos registrados",
        )

    db.delete(customer)
    db.commit()
    return None
