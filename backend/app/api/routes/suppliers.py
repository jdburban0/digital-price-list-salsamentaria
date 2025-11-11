from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal, SupplierDB, ProductDB 
from app.models.supplier import Supplier, SupplierCreate, SupplierUpdate 
from typing import List
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Rutas Publicas (para Clientes y Admin) ---

@router.get("", response_model=List[Supplier])
def list_suppliers(db: Session = Depends(get_db)):
    """Lista todos los proveedores."""
    return db.query(SupplierDB).order_by(SupplierDB.name).all()

@router.get("/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Obtiene un proveedor por su ID."""
    supplier = db.query(SupplierDB).filter(SupplierDB.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return supplier

# --- Rutas Protegidas (Solo Admin) ---

@router.post("", response_model=Supplier, status_code=201)
def create_supplier(
    payload: SupplierCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),  # Requiere token
):
    """Crea un nuevo proveedor."""
    existing = db.query(SupplierDB).filter(SupplierDB.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=409, detail="El proveedor ya existe")

    supplier = SupplierDB(
        name=payload.name.strip(),
        phone=payload.phone,
        email=payload.email
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/{supplier_id}", response_model=Supplier)
def update_supplier(
    supplier_id: int,
    payload: SupplierUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user), # Requiere token
):
    """Actualiza un proveedor por su ID."""
    supplier = db.query(SupplierDB).filter(SupplierDB.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    if payload.name:
        existing = db.query(SupplierDB).filter(
            SupplierDB.name.ilike(payload.name.strip()),
            SupplierDB.id != supplier_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Ya existe otro proveedor con ese nombre")

    # Actualizar campos
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user), # Requiere token
):
    """Elimina un proveedor por su ID."""
    supplier = db.query(SupplierDB).filter(SupplierDB.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    products_with_supplier = db.query(ProductDB).filter(ProductDB.supplier_id == supplier_id).count()
    if products_with_supplier > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar el proveedor, tiene {products_with_supplier} productos asociados."
        )

    db.delete(supplier)
    db.commit()
    return None

