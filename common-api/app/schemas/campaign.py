from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.campaigns_products import CampaignProductInput, CampaignProductResponse
from app.schemas.facebook_post import FacebookPostResponse


class CampaignProduct(BaseModel): ...


class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    start_date: datetime
    end_date: datetime
    status: Literal["active", "inactive"]
    channels: list[Literal["facebook_comment", "facebook_inbox"]] = Field(
        ..., min_items=1
    )
    post_id: UUID | None = None


class CampaignCreate(CampaignBase):
    pass


class CampaignWithProductsCreate(CampaignBase):
    products: list[CampaignProductInput] = Field(..., min_items=1)


class CampaignUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: Literal["active", "inactive"] | None = None
    channels: list[Literal["facebook_comment", "facebook_inbox"]] | None = Field(
        None, min_items=1
    )
    post_id: UUID | None = None


class CampaignWithProductsUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: Literal["active", "inactive"] | None = None
    channels: list[Literal["facebook_comment", "facebook_inbox"]] | None = None
    post_id: UUID | None = None
    products: list[CampaignProductInput] | None = None


class Campaign(CampaignBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None
    campaigns_products: list[CampaignProductResponse] = []
    post: FacebookPostResponse | None = None

    class Config:
        from_attributes = True
