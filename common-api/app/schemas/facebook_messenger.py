from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.facebook_profile import FacebookProfile


class FacebookInboxBase(BaseModel):
    profile_id: UUID
    messenger_id: str
    message: str | None = None
    type: str
    link: str | None = None
    published_at: datetime


class FacebookInboxCreate(FacebookInboxBase):
    pass


class FacebookInboxUpdate(BaseModel):
    message: str | None = None
    type: str | None = None
    link: str | None = None
    published_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookInboxResponse(FacebookInboxBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookInbox(FacebookInboxResponse):
    profile: FacebookProfile | None = None
