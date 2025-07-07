from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FacebookPostBase(BaseModel):
    profile_id: UUID
    post_id: str
    message: str | None = None
    link: str | None = None
    media_url: str | None = None
    media_type: Literal["image", "video"] | None = None
    status: Literal["active", "inactive"]
    published_at: datetime


class FacebookPostCreate(FacebookPostBase):
    pass


class FacebookPostUpdate(BaseModel):
    message: str | None = None
    link: str | None = None
    media_url: str | None = None
    media_type: Literal["image", "video"] | None = None
    status: Literal["active", "inactive"] | None = None
    published_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookPostResponse(FacebookPostBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookPost(FacebookPostResponse):
    pass
