from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FacebookProfileBase(BaseModel):
    facebook_id: str
    type: Literal["page", "user"]
    name: str
    profile_picture_url: str


class FacebookProfileCreate(FacebookProfileBase):
    pass


class FacebookProfileUpdate(BaseModel):
    facebook_id: str | None = None
    type: Literal["page", "user"] | None = None
    name: str | None = None
    profile_picture_url: str | None = None
    deleted_at: datetime | None = None


class FacebookProfileResponse(FacebookProfileBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookProfile(FacebookProfileResponse):
    pass
