from fastapi import APIRouter, Depends

from app.api.dependencies import database as deps
from app.api.v1.endpoints import auth, facebook_post, facebook_profile, users

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
