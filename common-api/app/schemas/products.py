from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    code: str
    name: str
    description: str | None = None
    quantity: int = 0
    unit: str | None = None
    full_price: float = 0
    selling_price: float = 0
    cost: float = 0
    shipping_fee: float = 0
    note: str | None = None
    keyword: str | None = None
    product_category: str | None = None
    product_type: str | None = None
    color: str | None = None
    size: str | None = None
    weight: float = 0


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    quantity: int | None = None
    unit: str | None = None
    full_price: float | None = None
    selling_price: float | None = None
    cost: float | None = None
    shipping_fee: float | None = None
    note: str | None = None
    keyword: str | None = None
    product_category: str | None = None
    product_type: str | None = None
    color: str | None = None
    size: str | None = None
    weight: float | None = None
    deleted_at: datetime | None = None


class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class Product(ProductResponse):
    pass
