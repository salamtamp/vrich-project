from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    campaign,
    facebook_comment,
    facebook_inbox,
    facebook_post,
    facebook_profile,
    notifications,
    users,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
)

api_router.include_router(
    facebook_profile.router,
    prefix="/facebook-profiles",
    tags=["facebook_profiles"],
)

api_router.include_router(
    facebook_post.router,
    prefix="/facebook-posts",
    tags=["facebook_posts"],
)

api_router.include_router(
    facebook_comment.router,
    prefix="/facebook-comments",
    tags=["facebook_comments"],
)

api_router.include_router(
    facebook_inbox.router,
    prefix="/facebook-inboxes",
    tags=["facebook_inboxes"],
)

api_router.include_router(
    campaign.router,
    prefix="/campaigns",
    tags=["campaigns"],
)

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"],
)

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"],
)
