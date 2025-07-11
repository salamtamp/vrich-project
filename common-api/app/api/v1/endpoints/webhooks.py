from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.db.repositories.facebook_comment import facebook_comment_repo
from app.db.repositories.facebook_inbox import facebook_inbox_repo
from app.db.repositories.facebook_post import facebook_post_repo
from app.db.repositories.facebook_profile import facebook_profile_repo
from app.schemas.common import (
    FacebookCommentWebhookRequest,
    FacebookInboxWebhookRequest,
    FacebookPostWebhookRequest,
)
from app.schemas.facebook_comment import FacebookComment
from app.schemas.facebook_messenger import FacebookInbox
from app.schemas.facebook_post import FacebookPost
from app.schemas.facebook_profile import FacebookProfile
from app.services.socketio_server import socketio

router = APIRouter()


@router.post("/facebook-posts")
async def facebook_posts_webhook(
    *,
    db: Session = Depends(get_db),
    data: FacebookPostWebhookRequest,
):
    """Webhook for Facebook post events."""
    post = facebook_post_repo.get_by_id(db, id=data.id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Load related profile
    profile = facebook_profile_repo.get_by_id(db, id=post.profile_id)
    post_profile = FacebookProfile.model_validate(profile) if profile else None
    post_response = FacebookPost.model_validate(post)
    post_response.profile = post_profile

    # Emit to all clients
    await socketio.emit("facebook_post.created", post_response.model_dump(mode="json"))
    # Emit to specific post
    await socketio.emit(
        f"facebook_post.{data.id}.created", post_response.model_dump(mode="json")
    )

    return post_response


@router.post("/facebook-comments")
async def facebook_comments_webhook(
    *,
    db: Session = Depends(get_db),
    data: FacebookCommentWebhookRequest,
):
    """Webhook for Facebook comment events."""
    comment = facebook_comment_repo.get_by_id(db, id=data.id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    # Load related post
    post = facebook_post_repo.get_by_id(db, id=comment.post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found for comment")

    # Load related profile
    profile = facebook_profile_repo.get_by_id(db, id=comment.profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for comment")

    comment_post = FacebookPost.model_validate(post) if post else None
    comment_profile = FacebookProfile.model_validate(profile) if profile else None
    comment_response = FacebookComment.model_validate(comment)
    comment_response.post = comment_post
    comment_response.profile = comment_profile

    # Emit to all clients
    await socketio.emit(
        "facebook_comment.created", comment_response.model_dump(mode="json")
    )
    # Emit to post and profile channels
    await socketio.emit(
        f"facebook_post.{post.id}.new_comment",
        comment_response.model_dump(mode="json"),
    )
    await socketio.emit(
        f"facebook_profile.{profile.id}.new_comment",
        comment_response.model_dump(mode="json"),
    )

    return comment_response


@router.post("/facebook-inboxes")
async def facebook_inboxes_webhook(
    *,
    db: Session = Depends(get_db),
    data: FacebookInboxWebhookRequest,
):
    """Webhook for Facebook inbox events."""
    inbox = facebook_inbox_repo.get_by_id(db, id=data.id)
    if not inbox:
        raise HTTPException(status_code=404, detail="Inbox not found")

    # Load related profile
    profile = facebook_profile_repo.get_by_id(db, id=inbox.profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found for inbox")

    inbox_profile = FacebookProfile.model_validate(profile) if profile else None
    inbox_response = FacebookInbox.model_validate(inbox)
    inbox_response.profile = inbox_profile

    # Emit to all clients
    await socketio.emit(
        "facebook_inbox.created", inbox_response.model_dump(mode="json")
    )
    # Emit to profile channel
    await socketio.emit(
        f"facebook_profile.{profile.id}.new_inbox",
        inbox_response.model_dump(mode="json"),
    )

    return inbox_response
