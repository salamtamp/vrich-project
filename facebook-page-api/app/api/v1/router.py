from fastapi import APIRouter

from app.api.v1.endpoints import facebooks, webhooks

api_router = APIRouter()

api_router.include_router(
    facebooks.router,
    prefix="/facebooks",
    tags=["facebooks"],
)

api_router.include_router(
    webhooks.router,
    prefix="/webhook",
    tags=["webhook"],
)
