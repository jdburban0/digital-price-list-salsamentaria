from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, conint

from app.models.customer import Customer
from app.models.product import Product


class OrderBase(BaseModel):
    customer_id: int = Field(..., gt=0)
    product_id: int = Field(..., gt=0)
    quantity: conint(ge=1) = 1
    status: Optional[str] = Field(default="pendiente", min_length=2, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=255)


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_id: Optional[int] = Field(default=None, gt=0)
    product_id: Optional[int] = Field(default=None, gt=0)
    quantity: Optional[conint(ge=1)] = None
    status: Optional[str] = Field(default=None, min_length=2, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=255)


class Order(BaseModel):
    id: int
    customer_id: int
    product_id: int
    quantity: int
    status: str
    notes: Optional[str]
    created_at: datetime
    customer: Customer
    product: Product

    class Config:
        from_attributes = True
