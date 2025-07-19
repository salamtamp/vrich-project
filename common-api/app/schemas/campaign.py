from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class CampaignProduct(BaseModel):
    # Define fields as needed, or use dict if dynamic
    ...


class CampaignBase(BaseModel):
    name: str
    status: Literal["active", "inactive"]
    products: list[dict]  # or List[CampaignProduct] if you want strict typing
    start_at: datetime
    end_at: datetime


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    name: str | None = None
    status: Literal["active", "inactive"] | None = None
    products: list[dict] | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None


class Campaign(CampaignBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
