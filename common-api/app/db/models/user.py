from sqlalchemy import Column, DateTime, Text, text

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class User(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "users"

    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    password = Column(Text, nullable=False)
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
