from datetime import datetime
from typing import Any
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
class ValidationRule(BaseModel):
    """Individual validation rule with parameters."""
    rule: str
    params: dict[str, Any] = {}

    @classmethod
    def parse(cls, rule_str: str) -> "ValidationRule":
        """Parse a validation rule string like 'min_length:2' or 'required'."""
        rule_str = rule_str.strip()
        if not rule_str:  # Handle empty strings
            return cls(rule="", params={})

        if ":" in rule_str:
            rule_name, param_str = rule_str.split(":", 1)
            rule_name = rule_name.strip()
            param_str = param_str.strip()
            # Parse parameters (e.g., "min_length:2" -> {"value": 2})
            try:
                # Handle negative numbers and zero properly
                if ((param_str.startswith('-') and param_str[1:].isdigit()) or
                    param_str.isdigit()):
                    param_value = int(param_str)
                else:
                    param_value = param_str
                return cls(rule=rule_name, params={"value": param_value})
            except ValueError:
                return cls(rule=rule_name, params={"value": param_str})
        else:
            return cls(rule=rule_str, params={})

class ColumnConfig(BaseModel):
    column: str
    validation: str = "optional"  # Comma-separated validation rules
    format: str | None = None  # Function name as string
    db_field: str
    default_value: Any = None

    @property
    def validation_rules(self) -> list[ValidationRule]:
        """Parse validation string into list of ValidationRule objects."""
        rules = []
        for rule in self.validation.split(","):
            rule = rule.strip()
            if rule:  # Only add non-empty rules
                rules.append(ValidationRule.parse(rule))
        return rules


class ExcelUploadConfig(BaseModel):
    columns: list[ColumnConfig] | None = None
    skip_header: bool | None = None
    skip_rows: int | None = None  # Number of additional rows to skip after header
    batch_size: int | None = None


class ExcelUploadResponse(BaseModel):
    total_rows: int
    successful_imports: int
    failed_imports: int
    errors: list[dict[str, Any]] = []
    message: str


class ProductBulkCreate(BaseModel):
    products: list[ProductCreate]
