from sqlalchemy import Column, DateTime, String, text

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookProfile(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_profiles"

    facebook_id = Column(String, nullable=False)
    type = Column(
        String,
        nullable=False,
    )  # Should be validated at the schema/service level
    name = Column(String, nullable=False)
    profile_picture_url = Column(String, nullable=False)
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
