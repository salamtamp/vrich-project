from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OrderBase(BaseModel):
    code: str
    profile_id: UUID
    campaign_id: UUID
    status: str
    purchase_date: datetime
    shipping_date: datetime | None = None
    delivery_date: datetime | None = None
    note: str | None = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    code: str | None = None
    profile_id: UUID | None = None
    campaign_id: UUID | None = None
    status: str | None = None
    purchase_date: datetime | None = None
    shipping_date: datetime | None = None
    delivery_date: datetime | None = None
    note: str | None = None
    deleted_at: datetime | None = None


class OrderResponse(OrderBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class Order(OrderResponse):
    pass
