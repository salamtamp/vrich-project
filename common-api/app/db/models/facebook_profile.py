import uuid

from sqlalchemy import Column, DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class FacebookProfile(Base):
    __tablename__ = "facebook_profiles"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        index=True,
    )
    facebook_id = Column(String, nullable=False)
    type = Column(
        String, nullable=False
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
