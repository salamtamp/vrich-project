from fastapi import APIRouter, Depends, HTTPException, Request

from app.constants.facebook_post import WEBHOOK_PROCESSED_MESSAGE
from app.core.config import settings
from app.db.repositories.facebook_comment import facebook_comment_repo
from app.db.repositories.facebook_messenger import facebook_messenger_repo
from app.db.repositories.facebook_post import facebook_post_repo
from app.db.session import get_db
from app.schemas.common import (
    FacebookCommentWebhookRequest,
    FacebookMessengerWebhookRequest,
    FacebookPostWebhookRequest,
)
from app.services.socketio_server import broadcast_to_authenticated_clients

router = APIRouter()


def check_internal_ip(request: Request):
    client_ip = request.client.host
    if client_ip not in settings.internal_webhook_ips:
        raise HTTPException(status_code=403, detail="Forbidden: Not an internal IP")


def serialize_model_with_relationships(model_instance):
    """Serialize model instance with its relationships"""
    if hasattr(model_instance, "to_dict"):
        data = model_instance.to_dict()
        # Add relationship data if available
        if hasattr(model_instance, "profile") and model_instance.profile:
            data["profile"] = (
                model_instance.profile.to_dict()
                if hasattr(model_instance.profile, "to_dict")
                else {
                    "id": str(model_instance.profile.id),
                    "name": getattr(model_instance.profile, "name", "Unknown"),
                    "profile_picture_url": getattr(
                        model_instance.profile, "profile_picture_url", None
                    ),
                }
            )
        return data
    # Fallback to __dict__ but handle relationships
    data = model_instance.__dict__.copy()
    # Remove SQLAlchemy internal attributes
    data.pop("_sa_instance_state", None)
    # Handle relationships
    if hasattr(model_instance, "profile") and model_instance.profile:
        data["profile"] = {
            "id": str(model_instance.profile.id),
            "name": getattr(model_instance.profile, "name", "Unknown"),
            "profile_picture_url": getattr(
                model_instance.profile, "profile_picture_url", None
            ),
        }
    return data


@router.post("/facebook-posts")
async def facebook_posts_webhook(
    data: FacebookPostWebhookRequest,
    request: Request,
    db=Depends(get_db),
):
    check_internal_ip(request)
    if not data.id:
        raise HTTPException(status_code=400, detail="Missing post id")
    post = facebook_post_repo.get_by_id(db, data.id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post_data = serialize_model_with_relationships(post)
    try:
        await broadcast_to_authenticated_clients("facebook_post.created", post_data)
        return {"status": "success", "message": WEBHOOK_PROCESSED_MESSAGE}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/facebook-messengers")
async def facebook_messengers_webhook(
    data: FacebookMessengerWebhookRequest,
    request: Request,
    db=Depends(get_db),
):
    check_internal_ip(request)
    if not data.id:
        raise HTTPException(status_code=400, detail="Missing messenger id")
    messenger = facebook_messenger_repo.get_by_id(db, data.id)
    if not messenger:
        raise HTTPException(status_code=404, detail="Messenger not found")
    messenger_data = serialize_model_with_relationships(messenger)
    try:
        await broadcast_to_authenticated_clients(
            "facebook_messenger.created", messenger_data
        )
        return {"status": "success", "message": WEBHOOK_PROCESSED_MESSAGE}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/facebook-comments")
async def facebook_comments_webhook(
    data: FacebookCommentWebhookRequest,
    request: Request,
    db=Depends(get_db),
):
    check_internal_ip(request)
    if not data.id:
        raise HTTPException(status_code=400, detail="Missing comment id")
    comment = facebook_comment_repo.get_by_id(db, data.id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    comment_data = serialize_model_with_relationships(comment)
    try:
        await broadcast_to_authenticated_clients(
            "facebook_comment.created", comment_data
        )
        return {"status": "success", "message": WEBHOOK_PROCESSED_MESSAGE}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
