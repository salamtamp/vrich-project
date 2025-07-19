from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProfileContactBase(BaseModel):
    profile_id: UUID
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    postal_code: str | None = None
    city: str | None = None
    country: str | None = None
    note: str | None = None


class ProfileContactCreate(ProfileContactBase):
    pass


class ProfileContactUpdate(BaseModel):
    profile_id: UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    postal_code: str | None = None
    city: str | None = None
    country: str | None = None
    note: str | None = None
    deleted_at: datetime | None = None


class ProfileContactResponse(ProfileContactBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class ProfileContact(ProfileContactResponse):
    pass
