from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookMessenger(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_messengers"
    __table_args__ = (
        UniqueConstraint(
            "messenger_id", name="facebook_messengers_messenger_id_unique"
        ),
    )

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    messenger_id = Column(String, nullable=False, unique=True)
    message = Column(String, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=False)
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
