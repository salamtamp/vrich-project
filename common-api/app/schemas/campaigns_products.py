from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class CampaignProductBase(BaseModel):
    campaign_id: UUID
    product_id: UUID
    keyword: str
    quantity: int = 0
    max_order_quantity: int | None = None
    status: str

class CampaignProductCreate(CampaignProductBase):
    pass

class CampaignProductUpdate(BaseModel):
    campaign_id: UUID | None = None
    product_id: UUID | None = None
    keyword: str | None = None
    quantity: int | None = None
    max_order_quantity: int | None = None
    status: str | None = None
    deleted_at: datetime | None = None

class CampaignProductResponse(CampaignProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)

class CampaignProduct(CampaignProductResponse):
    pass 