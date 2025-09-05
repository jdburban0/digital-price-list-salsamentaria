from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    categoria: str = Field(..., min_length=1, max_length=50)  # Añadido


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    name: str | None = Field(None, min_length=1, max_length=100)
    price: float | None = Field(None, ge=0)
    categoria: str | None = Field(None, min_length=1, max_length=50)  # Añadido


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
