from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, min_length=7, max_length=20)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, min_length=7, max_length=20)


class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True
