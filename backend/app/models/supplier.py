from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None

    # --- ANADIR ESTE VALIDADOR ---
    @field_validator("phone", "email", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        """Convierte strings vacios en None para campos opcionales."""
        if v == "":
            return None
        return v
    # --- FIN DEL VALIDADOR ---

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None

class Supplier(SupplierBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

