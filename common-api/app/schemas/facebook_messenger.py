from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.facebook_profile import FacebookProfile


class FacebookMessengerBase(BaseModel):
    profile_id: UUID
    messenger_id: str
    message: str
    sent_at: datetime


class FacebookMessengerCreate(FacebookMessengerBase):
    pass


class FacebookMessengerUpdate(BaseModel):
    message: str | None = None
    sent_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookMessengerResponse(FacebookMessengerBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookMessenger(FacebookMessengerResponse):
    profile: FacebookProfile | None = None
