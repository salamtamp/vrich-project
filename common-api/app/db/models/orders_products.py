from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class OrderProduct(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "orders_products"
    __table_args__ = (
        UniqueConstraint(
            "order_id", "profile_id", "campaign_product_id", name="unique_order_product"
        ),
    )
    order_id = Column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False
    )
    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    campaign_product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("campaigns_products.id", ondelete="CASCADE"),
        nullable=False,
    )
    quantity = Column(Integer, nullable=False, default=0)
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
    order = relationship("Order", back_populates="order_products")
    profile = relationship("FacebookProfile")
    campaign_product = relationship("CampaignProduct", back_populates="order_products")
