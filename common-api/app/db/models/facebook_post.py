from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookPost(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_posts"
    __table_args__ = (
        UniqueConstraint("post_id", name="facebook_posts_post_id_unique"),
    )

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    post_id = Column(Text, nullable=False)
    message = Column(Text, nullable=True)
    type = Column(Text, nullable=True)
    link = Column(Text, nullable=True)
    media_url = Column(Text, nullable=True)
    media_type = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
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
