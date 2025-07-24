from app.api.middleware.logging import LoggingMiddleware
from app.api.middleware.security import SecurityMiddleware
from app.core.config import settings, get_settings, connect_queue, connect_database
from app.core.logging import setup_logging
from app.services.queue_consumer import QueueConsumer

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global queue_consumer

    setup_logging()
    connect_queue(settings)
    connect_database(settings)

    queue_consumer = QueueConsumer()
    queue_consumer.start()

    yield

    if queue_consumer:
        queue_consumer.stop()


def create_app() -> FastAPI:
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


@app.post("/queue/start")
def start_queue_consumer():
    global queue_consumer
    if queue_consumer and not queue_consumer.is_running:
        queue_consumer.start()
        return JSONResponse(
            content={"message": "Queue consumer started"}, status_code=200
        )
    return JSONResponse(
        content={"message": "Queue consumer already running"}, status_code=400
    )


@app.post("/queue/stop")
def stop_queue_consumer():
    global queue_consumer
    if queue_consumer and queue_consumer.is_running:
        queue_consumer.stop()
        return JSONResponse(
            content={"message": "Queue consumer stopped"}, status_code=200
        )
    return JSONResponse(
        content={"message": "Queue consumer not running"}, status_code=400
    )
