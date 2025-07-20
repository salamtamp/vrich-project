from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PaymentBase(BaseModel):
    profile_id: UUID
    order_id: UUID
    payment_code: str
    payment_slip: str | None = None
    payment_date: datetime | None = None
    amount: float
    method: str
    status: str
    note: str | None = None
    refund_id: UUID | None = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    profile_id: UUID | None = None
    order_id: UUID | None = None
    payment_code: str | None = None
    payment_slip: str | None = None
    payment_date: datetime | None = None
    amount: float | None = None
    method: str | None = None
    status: str | None = None
    note: str | None = None
    refund_id: UUID | None = None
    deleted_at: datetime | None = None


class PaymentResponse(PaymentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class Payment(PaymentResponse):
    pass
