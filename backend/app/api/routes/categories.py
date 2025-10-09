from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import SessionLocal, CategoryDB
from app.models.category import Category, CategoryCreate
from typing import List
from app.auth.dependencies import get_current_user  #  import

router = APIRouter(prefix="/categories", tags=["categories"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[Category])
def list_categories(db: Session = Depends(get_db)):
    return db.query(CategoryDB).all()


# PROTEGIDO
@router.post("", response_model=Category, status_code=201)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),  # requiere token
):
    existing = db.query(CategoryDB).filter(CategoryDB.name.ilike(payload.name)).first()
    if existing:
        raise HTTPException(status_code=409, detail="La categoría ya existe")

    category = CategoryDB(name=payload.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

