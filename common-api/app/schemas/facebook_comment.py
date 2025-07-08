from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class FacebookCommentBase(BaseModel):
    profile_id: UUID
    post_id: UUID
    comment_id: str
    message: str | None = None
    published_at: datetime


class FacebookCommentCreate(FacebookCommentBase):
    pass


class FacebookCommentUpdate(BaseModel):
    message: str | None = None
    published_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookCommentResponse(FacebookCommentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookComment(FacebookCommentResponse):
    pass
