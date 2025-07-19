from sqlalchemy import Column, DateTime, Integer, Numeric, Text, text
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class Product(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "products"
    code = Column(Text, nullable=False, unique=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Integer, default=0)
    unit = Column(Text, nullable=True)
    full_price = Column(Numeric(12, 2), default=0)
    selling_price = Column(Numeric(12, 2), default=0)
    cost = Column(Numeric(12, 2), default=0)
    shipping_fee = Column(Numeric(12, 2), default=0)
    note = Column(Text, nullable=True)
    keyword = Column(Text, nullable=True)
    product_category = Column(Text, nullable=True)
    product_type = Column(Text, nullable=True)
    color = Column(Text, nullable=True)
    size = Column(Text, nullable=True)
    weight = Column(Numeric(10, 2), default=0)
    campaigns_products = relationship("CampaignProduct", back_populates="product")
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
