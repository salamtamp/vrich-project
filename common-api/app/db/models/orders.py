from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class Order(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "orders"
    __table_args__ = (
        UniqueConstraint("profile_id", "campaign_id", name="unique_profile_campaign"),
    )
    code = Column(
        Text, nullable=False, unique=True, server_default=text("generate_order_code()")
    )
    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    campaign_id = Column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )
    status = Column(Text, nullable=False)
    purchase_date = Column(DateTime(timezone=True), nullable=True)
    shipping_date = Column(DateTime(timezone=True), nullable=True)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    note = Column(Text, nullable=True)
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
    profile = relationship("FacebookProfile", back_populates="orders")
    campaign = relationship("Campaign", back_populates="orders")
    payments = relationship("Payment", back_populates="order")
    orders_products = relationship("OrderProduct", back_populates="order")
    campaigns_notifications = relationship(
        "CampaignNotification", back_populates="order"
    )
