from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal, SupplierDB
from app.models.supplier import Supplier, SupplierCreate
from typing import List
from app.auth.dependencies import get_current_user  # import

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[Supplier])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(SupplierDB).all()


# PROTEGIDO
@router.post("", response_model=Supplier, status_code=201)
def create_supplier(
    payload: SupplierCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),  # requiere token
):
    existing = db.query(SupplierDB).filter(SupplierDB.name.ilike(payload.name)).first()
    if existing:
        raise HTTPException(status_code=409, detail="El proveedor ya existe")

    supplier = SupplierDB(name=payload.name, phone=payload.phone, email=payload.email)
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

