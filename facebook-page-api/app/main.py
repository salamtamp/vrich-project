from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.middleware.logging import LoggingMiddleware
from app.api.middleware.security import SecurityMiddleware
from app.api.v1.router import api_router
from app.core.config import connect_queue, get_settings
from app.core.logging import setup_logging

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    connect_queue(settings)
    yield


def create_app() -> FastAPI:
    if not settings.FACEBOOK_BASE_URL:
        raise ValueError("FACEBOOK_BASE_URL is not set")

    if not settings.FACEBOOK_PAGE_ACCESS_TOKEN:
        raise ValueError("FACEBOOK_PAGE_ACCESS_TOKEN is not set")

    if not settings.FACEBOOK_INBOX_VERIFY_TOKEN:
        raise ValueError("FACEBOOK_INBOX_VERIFY_TOKEN is not set")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        lifespan=lifespan,
        port=settings.API_PORT,
        host=settings.API_HOST,
    )

    app.add_middleware(SecurityMiddleware)
    app.add_middleware(LoggingMiddleware)

    app.include_router(api_router, prefix="/api/v1")

    return app


app = create_app()

@app.get("/")
def root_health_check():
    return JSONResponse(
        content={
            "status": "OK",
        },
        status_code=200,
    )


@app.get("/healthcheck")
def health_check():
    return JSONResponse(
        content={
            "status": "OK",
        },
        status_code=200,
    )