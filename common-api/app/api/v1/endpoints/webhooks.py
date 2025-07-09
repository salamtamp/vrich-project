from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.db.repositories.facebook_comment import facebook_comment_repo
from app.db.repositories.facebook_inbox import facebook_inbox_repo
from app.db.repositories.facebook_post import facebook_post_repo
from app.schemas.common import (
    FacebookCommentWebhookRequest,
    FacebookInboxWebhookRequest,
    FacebookPostWebhookRequest,
)
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

    post_data = {
        "id": str(post.id),
        "profile_id": str(post.profile_id),
        "post_id": post.post_id,
        "message": post.message,
        "type": post.type,
        "link": post.link,
        "media_url": post.media_url,
        "media_type": post.media_type,
        "status": post.status,
        "published_at": post.published_at.isoformat() if post.published_at else None,
    }

    # Emit to all clients
    await socketio.emit("facebook_post.created", post_data)
    # Emit to specific post
    await socketio.emit(f"facebook_post.{data.id}.created", post_data)

    return {"status": "success"}


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

    comment_data = {
        "id": str(comment.id),
        "profile_id": str(comment.profile_id),
        "post_id": str(comment.post_id),
        "comment_id": comment.comment_id,
        "message": comment.message,
        "type": comment.type,
        "link": comment.link,
        "published_at": (
            comment.published_at.isoformat() if comment.published_at else None
        ),
    }

    # Emit to all clients
    await socketio.emit("facebook_comment.created", comment_data)
    # Emit to specific comment
    await socketio.emit(f"facebook_comment.{data.id}.created", comment_data)

    return {"status": "success"}


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

    inbox_data = {
        "id": str(inbox.id),
        "profile_id": str(inbox.profile_id),
        "messenger_id": inbox.messenger_id,
        "message": inbox.message,
        "type": inbox.type,
        "link": inbox.link,
        "published_at": inbox.published_at.isoformat() if inbox.published_at else None,
    }

    # Emit to all clients
    await socketio.emit("facebook_inbox.created", inbox_data)
    # Emit to specific inbox
    await socketio.emit(f"facebook_inbox.{data.id}.created", inbox_data)

    return {"status": "success"}
