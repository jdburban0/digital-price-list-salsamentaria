from pydantic import BaseModel, Field
from typing import Optional


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    categoria_id: int = Field(..., description="ID de la categoría relacionada")
    supplier_id: int = Field(..., description="ID del proveedor relacionado")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    categoria_id: Optional[int] = None
    supplier_id: Optional[int] = None


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


