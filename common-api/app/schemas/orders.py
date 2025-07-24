from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.facebook_profile import FacebookProfile
from app.schemas.orders_products import OrderProduct, OrderProductCreate
from app.schemas.profiles_contacts import ProfileContact
from app.schemas.payments import Payment

OrderStatus = Literal[
    "pending",
    "confirmed",
    "paid",
    "approved",
    "shipped",
    "delivered",
    "cancelled",
    "completed",
]


class OrderBase(BaseModel):
    code: str | None = None
    profile_id: UUID
    campaign_id: UUID
    status: OrderStatus
    purchase_date: datetime | None = None
    shipping_date: datetime | None = None
    delivery_date: datetime | None = None
    note: str | None = None


class OrderCreate(OrderBase):
    orders_products: list[OrderProductCreate] = []


class OrderUpdate(BaseModel):
    code: str | None = None
    profile_id: UUID | None = None
    campaign_id: UUID | None = None
    status: OrderStatus | None = None
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
    profile: FacebookProfile | None = None
    profile_contact: ProfileContact | None = None
    orders_products: list[OrderProduct] = []
    payments: list[Payment] = []
    model_config = ConfigDict(from_attributes=True)


class Order(OrderResponse):
    pass


class BatchOrderStatusUpdateRequest(BaseModel):
    ids: list[UUID]
    status: OrderStatus
