from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from app.db import SessionLocal, CategoryDB, ProductDB 
from app.models.category import Category, CategoryCreate, CategoryUpdate   
from typing import List
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.get("", response_model=List[Category])
def list_categories(db: Session = Depends(get_db)):
    """Lista todas las categorías."""
    return db.query(CategoryDB).order_by(CategoryDB.name).all()

@router.get("/{category_id}", response_model=Category)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Obtiene una categoría por su ID."""
    category = db.query(CategoryDB).filter(CategoryDB.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    return category

# --- Rutas Protegidas (Solo Admin) ---

@router.post("", response_model=Category, status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),  # Requiere token
):
    """Crea una nueva categoría."""
    existing = db.query(CategoryDB).filter(CategoryDB.name.ilike(payload.name.strip())).first()
    if existing:
        raise HTTPException(status_code=409, detail="La categoría ya existe")

    category = CategoryDB(name=payload.name.strip())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    payload: CategoryUpdate, 
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user), # Requiere token
):
    """Actualiza una categoría por su ID."""
    category = db.query(CategoryDB).filter(CategoryDB.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    if payload.name:
        existing = db.query(CategoryDB).filter(
            CategoryDB.name.ilike(payload.name.strip()),
            CategoryDB.id != category_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Ya existe otra categoría con ese nombre")
        category.name = payload.name.strip() # type: ignore

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user), # Requiere token
):
    """Elimina una categoría por su ID."""
    category = db.query(CategoryDB).filter(CategoryDB.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")


    products_in_category = db.query(ProductDB).filter(ProductDB.categoria_id == category_id).count()
    if products_in_category > 0:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar la categoría, tiene {products_in_category} productos asociados."
        )

    db.delete(category)
    db.commit()
    return None

