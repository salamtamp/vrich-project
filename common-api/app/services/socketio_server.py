import asyncio
import logging

import socketio

from app.core import security

print("Creating Socket.IO server...")
sio = socketio.AsyncServer(
    async_mode="asgi", cors_allowed_origins="*", logger=True, engineio_logger=True
)
print("Socket.IO server created successfully")

connected_clients: dict[str, str] = {}
background_tasks = set()


@sio.event
def connect(sid, environ, auth):
    """Handle client connection with OAuth token"""
    logging.info(f"Connection attempt from {sid}")

    try:
        token = auth.get("token") if auth else None

        if not token:
            logging.warning(f"Connection rejected: No token provided for {sid}")
            return False

        try:
            payload = security.decode_access_token(token)
            user_id = payload.get("sub")

            if not user_id:
                logging.warning(f"Connection rejected: No user_id in token for {sid}")
                return False

        except Exception as e:
            logging.error(f"Token validation failed for {sid}: {e}")
            return False

        connected_clients[sid] = user_id
        task = asyncio.create_task(
            sio.emit("connected", {"status": "connected", "user_id": user_id}, room=sid)
        )
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)
        logging.info(f"Client {sid} connected as user {user_id}")
        return True

    except Exception as e:
        logging.error(f"Connection error for {sid}: {e}")
        return False


@sio.event
def disconnect(sid):
    if sid in connected_clients:
        user_id = connected_clients.pop(sid)
        logging.info(f"Client {sid} (user {user_id}) disconnected")
    else:
        logging.info(f"Client {sid} disconnected (was not authenticated)")


@sio.event
def connect_error(sid, data):
    """Handle connection errors"""
    logging.error(f"Connection error for {sid}: {data}")
    return False


@sio.event
def join_room(sid, data):
    room = data.get("room")
    if room and sid in connected_clients:
        task1 = asyncio.create_task(sio.enter_room(sid, room))
        background_tasks.add(task1)
        task1.add_done_callback(background_tasks.discard)
        task2 = asyncio.create_task(sio.emit("joined_room", {"room": room}, room=sid))
        background_tasks.add(task2)
        task2.add_done_callback(background_tasks.discard)
        logging.info(f"Client {sid} joined room: {room}")
    else:
        logging.warning(
            f"Client {sid} attempted to join room without authentication or room data"
        )


async def broadcast_to_authenticated_clients(event: str, data: dict):
    """Broadcast event to all authenticated clients"""
    logging.info(f"Broadcasting {event} to {len(connected_clients)} clients")
    logging.info(f"Event data: {data}")

    if not connected_clients:
        logging.warning("No connected clients to broadcast to")
        return

    for sid in connected_clients:
        try:
            await sio.emit(event, data, room=sid)
            logging.info(f"Successfully sent {event} to client {sid}")
        except Exception as e:
            logging.error(f"Failed to send {event} to client {sid}: {e}")
            # Remove disconnected client
            if sid in connected_clients:
                connected_clients.pop(sid)

# At the end of the file, export the instance as 'socketio' for external use
socketio = sio
