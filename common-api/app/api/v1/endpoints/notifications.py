from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.webhook_cache_service import webhook_cache_service

router = APIRouter()


@router.get("/latest", summary="Get latest notifications for each type from Redis")
async def get_latest_notifications(db: Session = Depends(get_db)):
    """
    Get all notifications for each type from Redis cache.
    This returns real-time webhook data instead of mock database data.
    """
    try:
        posts = await webhook_cache_service.client.get_recent_webhook_data("posts")
        messages = await webhook_cache_service.client.get_recent_webhook_data("inboxes")
        comments = await webhook_cache_service.client.get_recent_webhook_data(
            "comments"
        )

        return {
            "posts": posts,
            "messages": messages,
            "comments": comments,
        }
    except Exception:
        return {
            "posts": [],
            "messages": [],
            "comments": [],
        }
