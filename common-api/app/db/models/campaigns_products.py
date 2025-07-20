from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class CampaignProduct(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "campaigns_products"
    campaign_id = Column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    keyword = Column(Text, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    max_order_quantity = Column(Integer, nullable=True)
    status = Column(Text, nullable=False)
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
    campaign = relationship("Campaign", back_populates="campaigns_products")
    product = relationship("Product", back_populates="campaigns_products")
    order_products = relationship("OrderProduct", back_populates="campaign_product")

    @property
    def campaign_name(self):
        return self.campaign.name if self.campaign else None

    @property
    def product_name(self):
        return self.product.name if self.product else None
