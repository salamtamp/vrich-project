from fastapi import APIRouter

from app.api.v1.endpoints import facebooks

api_router = APIRouter()

api_router.include_router(
    facebooks.router,
    prefix="/facebooks",
    tags=["facebooks"],
)
