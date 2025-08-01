from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.products import Product


class CampaignProductBase(BaseModel):
    campaign_id: UUID
    product_id: UUID
    keyword: str
    quantity: int = 0
    max_order_quantity: int | None = None
    status: Literal['active', 'inactive']


class CampaignProductCreate(CampaignProductBase):
    pass


class CampaignProductUpdate(BaseModel):
    campaign_id: UUID | None = None
    product_id: UUID | None = None
    keyword: str | None = None
    quantity: int | None = None
    max_order_quantity: int | None = None
    status: Literal['active', 'inactive'] | None = None
    deleted_at: datetime | None = None


class CampaignProductResponse(CampaignProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    product: Product | None = None
    model_config = ConfigDict(from_attributes=True)


class CampaignProduct(CampaignProductResponse):
    pass


class CampaignProductInput(BaseModel):
    product_id: UUID
    keyword: str
    quantity: int = 0
    status: Literal['active', 'inactive']
