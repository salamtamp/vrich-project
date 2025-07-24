from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.campaigns_products import CampaignProduct


class OrderProductBase(BaseModel):
    order_id: UUID
    profile_id: UUID
    campaign_product_id: UUID
    quantity: int = 0


class OrderProductCreate(OrderProductBase):
    pass


class OrderProductUpdate(BaseModel):
    order_id: UUID | None = None
    profile_id: UUID | None = None
    campaign_product_id: UUID | None = None
    quantity: int | None = None
    deleted_at: datetime | None = None


class OrderProductResponse(OrderProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    campaign_product: CampaignProduct | None = None
    model_config = ConfigDict(from_attributes=True)


class OrderProduct(OrderProductResponse):
    pass

OrderProductResponse.model_rebuild()
