from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.schemas.facebook_post import FacebookPost
from app.schemas.facebook_profile import FacebookProfile


class FacebookCommentBase(BaseModel):
    profile_id: UUID
    post_id: UUID
    comment_id: str
    message: str | None = None
    type: str
    link: str | None = None
    published_at: datetime


class FacebookCommentCreate(FacebookCommentBase):
    pass


class FacebookCommentUpdate(BaseModel):
    message: str | None = None
    type: str | None = None
    link: str | None = None
    published_at: datetime | None = None
    deleted_at: datetime | None = None


class FacebookCommentResponse(FacebookCommentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class FacebookComment(FacebookCommentResponse):
    profile: FacebookProfile | None = None
    post: FacebookPost | None = None
