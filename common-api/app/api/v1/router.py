from fastapi import APIRouter, Depends

from app.api.dependencies import database as deps
from app.api.v1.endpoints import (
    auth,
    facebook_comment,
    facebook_messenger,
    facebook_post,
    facebook_profile,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(deps.store_current_user)],
)

api_router.include_router(
    facebook_profile.router,
    prefix="/facebook-profiles",
    tags=["facebook_profile"],
    dependencies=[Depends(deps.store_current_user)],
)

api_router.include_router(
    facebook_post.router,
    prefix="/facebook-posts",
    tags=["facebook_post"],
    dependencies=[Depends(deps.store_current_user)],
)

api_router.include_router(
    facebook_messenger.router,
    prefix="/facebook_messengers",
    tags=["facebook_messengers"],
    dependencies=[Depends(deps.store_current_user)],
)

api_router.include_router(
    facebook_comment.router,
    prefix="/facebook-comments",
    tags=["facebook_comment"],
    dependencies=[Depends(deps.store_current_user)],
)
