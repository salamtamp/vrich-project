from sqlalchemy import Column, DateTime, Text, text

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookProfile(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_profiles"

    facebook_id = Column(Text, unique=True, nullable=False)
    type = Column(
        Text,
        nullable=False,
    )  # Should be validated at the schema/service level
    name = Column(Text, nullable=False)
    profile_picture_url = Column(Text, nullable=True)
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
