import logging
import sys
from contextlib import asynccontextmanager, suppress

import socketio # type: ignore
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core import security
from app.services.socketio_server import sio
from app.utils.redis import redis_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    with suppress(Exception):
        await redis_client.connect()
    yield
    with suppress(Exception):
        await redis_client.disconnect()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

socket_app = socketio.ASGIApp(sio, app)


@app.get("/healthcheck")
async def health_check():
    from app.services.socketio_server import connected_clients

    return {"status": "healthy", "connected_clients": len(connected_clients)}


@app.get("/debug/token")
async def debug_token(token: str):
    """Debug endpoint to test token validation"""
    try:
        payload = security.decode_access_token(token)
        return {"valid": True, "payload": payload}
    except Exception as e:
        return {"valid": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(socket_app, host="0.0.0.0", port=8000, log_level="info")
