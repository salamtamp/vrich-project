from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.facebook_profile import FacebookProfile, FacebookProfileResponse


class FacebookPostBase(BaseModel):
    profile_id: UUID
    post_id: str
    message: str | None = None
    type: str | None = None
    link: str | None = None
    media_url: str | None = None
    media_type: Literal["image", "video"] | None = None
    status: str | None = None
    published_at: datetime | None = None


class FacebookPostCreate(FacebookPostBase):
    pass


class FacebookPostUpdate(BaseModel):
    profile_id: UUID | None = None
    message: str | None = None
    type: str | None = None
    link: str | None = None
    media_url: str | None = None
    media_type: Literal["image", "video"] | None = None
    status: str | None = None
    published_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookPostResponse(FacebookPostBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    profile: FacebookProfileResponse | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookPost(FacebookPostResponse):
    profile: FacebookProfile | None = None
