import logging
import sys

import socketio
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


# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include existing API routers
app.include_router(api_router, prefix="/api/v1")

# Combine FastAPI and Socket.IO
print("Initializing Socket.IO ASGI app...")
socket_app = socketio.ASGIApp(sio, app)
print("Socket.IO ASGI app initialized successfully")

@app.on_event("startup")
async def startup_event():
    """Initialize Redis connection on startup."""
    try:
        await redis_client.connect()
        print("Redis connection established")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")
        print("Application will continue without Redis caching")

@app.on_event("shutdown")
async def shutdown_event():
    """Close Redis connection on shutdown."""
    try:
        await redis_client.disconnect()
        print("Redis connection closed")
    except Exception as e:
        print(f"Error closing Redis connection: {e}")


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
