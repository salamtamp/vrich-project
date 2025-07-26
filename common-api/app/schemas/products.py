from datetime import datetime
from typing import Any, Literal
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


# Excel Upload Schemas
class ColumnConfig(BaseModel):
    column: str
    validate: Literal["required", "optional"] = "optional"
    format: str | None = None  # Function name as string
    db_field: str
    default_value: Any = None


class ExcelUploadConfig(BaseModel):
    columns: list[ColumnConfig]
    skip_header: bool = True
    skip_rows: int = 0  # Number of additional rows to skip after header
    batch_size: int = 100


class ExcelUploadResponse(BaseModel):
    total_rows: int
    successful_imports: int
    failed_imports: int
    errors: list[dict[str, Any]] = []
    message: str


class ProductBulkCreate(BaseModel):
    products: list[ProductCreate]
