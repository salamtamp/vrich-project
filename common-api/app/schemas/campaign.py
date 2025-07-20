from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class CampaignProduct(BaseModel):
    # Define fields as needed, or use dict if dynamic
    ...


class CampaignBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    start_date: datetime
    end_date: datetime
    status: Literal["active", "inactive"]
    channels: list[Literal["facebook_comment", "facebook_inbox"]] = Field(
        ..., min_items=1
    )


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: Literal["active", "inactive"] | None = None
    channels: list[Literal["facebook_comment", "facebook_inbox"]] | None = Field(
        None, min_items=1
    )


class Campaign(CampaignBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

    class Config:
        from_attributes = True
