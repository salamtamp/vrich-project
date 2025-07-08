from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookPost(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_posts"
    __table_args__ = (
        UniqueConstraint("profile_id", "post_id", name="facebook_posts_post_id_unique"),
    )

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    post_id = Column(String, nullable=False)
    message = Column(String, nullable=True)
    link = Column(String, nullable=True)
    media_url = Column(String, nullable=True)
    media_type = Column(
        String,
        nullable=True,
    )  # Should be validated at the schema/service level
    status = Column(
        String,
        nullable=False,
    )  # Should be validated at the schema/service level
    published_at = Column(DateTime(timezone=True), nullable=False)
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

    profile = relationship("FacebookProfile", backref="posts")
