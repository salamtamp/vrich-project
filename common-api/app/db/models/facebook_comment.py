from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.models.base import UUIDPrimaryKeyMixin
from app.db.session import Base


class FacebookComment(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "facebook_comments"
    __table_args__ = (
        UniqueConstraint("comment_id", name="facebook_comments_comment_id_unique"),
    )

    profile_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    post_id = Column(
        UUID(as_uuid=True),
        ForeignKey("facebook_posts.id", ondelete="CASCADE"),
        nullable=False,
    )
    comment_id = Column(Text, nullable=False, unique=True)
    message = Column(Text, nullable=True)
    type = Column(Text, nullable=False)
    link = Column(Text, nullable=True)
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

    profile = relationship("FacebookProfile", back_populates="comments")
    post = relationship("FacebookPost", back_populates="comments")
