from sqlalchemy import Column, DateTime, ForeignKey, Numeric, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class Payment(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "payments"
    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    order_id = Column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    payment_code = Column(Text, nullable=False, unique=True)
    payment_slip = Column(Text, nullable=True)
    payment_date = Column(DateTime(timezone=True), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    method = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    note = Column(Text, nullable=True)
    refund_id = Column(
        UUID(as_uuid=True), ForeignKey("payments.id", ondelete="CASCADE"), nullable=True
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    profile = relationship("FacebookProfile", back_populates="payments")
    order = relationship("Order", back_populates="payments")
    refund = relationship("Payment", remote_side="Payment.id", back_populates="refunds")
    refunds = relationship("Payment", back_populates="refund")
