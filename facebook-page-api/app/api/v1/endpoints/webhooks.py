from app.core.config import get_queue, get_settings
from app.utils.queue import Queue
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

import httpx
import json
import logging
import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

class FacebookSender(BaseModel):
    id: str
    name: Optional[str] = None

class FacebookRecipient(BaseModel):
    id: str
    name: Optional[str] = None

class FacebookMessageAttachmentPayload(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None

    def __getitem__(self, key: str):
        """Support dictionary-like access for backward compatibility with tests"""
        if key == "url":
            return self.url
        elif key == "title":
            return self.title
        raise KeyError(key)

class FacebookMessageAttachment(BaseModel):
    type: str
    payload: FacebookMessageAttachmentPayload

class FacebookMessage(BaseModel):
    mid: Optional[str] = None
    text: Optional[str] = None
    attachments: Optional[List[FacebookMessageAttachment]] = None

class FacebookMessagingEvent(BaseModel):
    sender: FacebookSender
    recipient: Optional[FacebookRecipient] = None
    timestamp: Optional[int] = None
    message: Optional[FacebookMessage] = None

class FacebookEntry(BaseModel):
    id: Optional[str] = None
    time: Optional[int] = None
    messaging: List[FacebookMessagingEvent]

class FacebookWebhookBody(BaseModel):
    object: str
    entry: List[FacebookEntry]


def format_text_message(recipient_id: str, message_text: str) -> Dict[str, Any]:
    return {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text}
    }


def format_media_message(
    recipient_id: str,
    media_type: str,
    media_url: str,
    is_reusable: bool = False
) -> Dict[str, Any]:
    """Format a media message for Facebook API."""
    return {
        "recipient": {"id": recipient_id},
        "message": {
            "attachment": {
                "type": media_type,
                "payload": {
                    "url": media_url,
                    "is_reusable": is_reusable
                }
            }
        }
    }


def process_text_message(sender_id: str, message: FacebookMessage, timestamp: Optional[int]) -> Dict[str, Any]:
    if not message.text:
        return {}

    formatted_message = format_text_message(sender_id, message.text)

    log_data = {
        "event": "text_message",
        "sender_id": sender_id,
        "message_data": formatted_message,
        "timestamp": timestamp
    }

    logger.info("Text message received", extra=log_data)
    print(json.dumps(log_data, indent=2))

    return log_data


def process_media_message(sender_id: str, message: FacebookMessage, timestamp: Optional[int]) -> Dict[str, Any]:
    if not message.attachments:
        return {}

    ALLOWED_MEDIA_TYPES = {"image", "video", "audio", "file"}
    processed_attachments = []

    for attachment in message.attachments:
        attachment_type = attachment.type

        if attachment_type in ALLOWED_MEDIA_TYPES:
            media_url = attachment.payload.url
            if not media_url:
                logger.warning(f"No URL found for {attachment_type} attachment")
                continue

            formatted_message = format_media_message(
                recipient_id=sender_id,
                media_type=attachment_type,
                media_url=media_url
            )

            log_data = {
                "event": "media_message",
                "sender_id": sender_id,
                "message_data": formatted_message,
                "timestamp": timestamp
            }

            logger.info(f"Media message received: {attachment_type}", extra=log_data)
            print(json.dumps(log_data, indent=2))
            processed_attachments.append(log_data)
        else:
            log_data = {
                "event": "unsupported_attachment_type",
                "sender_id": sender_id,
                "message_data": message.model_dump(),
                "timestamp": timestamp
            }

            logger.warning(f"Unsupported attachment type: {attachment_type}", extra=log_data)
            print(json.dumps(log_data, indent=2))
            processed_attachments.append(log_data)

    return {"attachments": processed_attachments} if processed_attachments else {}


def process_messaging_event(messaging_event: FacebookMessagingEvent) -> Dict[str, Any]:
    sender_id = messaging_event.sender.id
    message = messaging_event.message
    timestamp = messaging_event.timestamp

    if not message:
        return {}

    # Process text messages
    if message.text:
        return process_text_message(sender_id, message, timestamp)
    elif message.attachments:
        return process_media_message(sender_id, message, timestamp)
    else:
        log_data = {
            "event": "unsupported_message_type",
            "sender_id": sender_id,
            "message_data": message.model_dump(),
            "timestamp": timestamp
        }

        logger.warning("Unsupported message type", extra=log_data)
        print(json.dumps(log_data, indent=2))
        return log_data


def process_webhook_body(body: FacebookWebhookBody) -> List[Dict[str, Any]]:
    if body.object != "page":
        logger.warning(f"Received webhook for object type: {body.object}")
        return []

    processed_events = []
    for entry in body.entry:
        for messaging_event in entry.messaging:
            try:
                event_data = process_messaging_event(messaging_event)
                if event_data:
                    processed_events.append(event_data)
            except Exception as e:
                logger.error(f"Error processing messaging event: {e}", exc_info=True)
                error_data = {
                    "event": "processing_error",
                    "error": str(e),
                    "timestamp": messaging_event.timestamp if messaging_event.timestamp else None
                }
                processed_events.append(error_data)

    return processed_events


@router.get("/")
async def verify_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge")
):
    settings = get_settings()

    if hub_mode == "subscribe" and hub_verify_token == settings.FACEBOOK_INBOX_VERIFY_TOKEN:
        logger.info("Webhook verification successful")
        return PlainTextResponse(hub_challenge, status_code=200)

    logger.warning("Webhook verification failed")
    return PlainTextResponse("Verification failed", status_code=403)


@router.post("/")
async def handle_webhook(request: Request):
    settings = get_settings()

    queue = get_queue()
    if not queue:
        queue = Queue(
            host=settings.QUEUE_HOST,
            username=settings.QUEUE_USER,
            password=settings.QUEUE_PASS
        )
        queue.connect()

    try:
        body_data = await request.json()
        body = FacebookWebhookBody(**body_data)

        if not body.object or \
            not body.entry or \
                not body.entry[0].messaging \
                    or not body.entry[0].messaging[0].sender \
                        or not body.entry[0].messaging[0].message:
            logger.error("Missing required fields in webhook body")
            return JSONResponse(
                content={"status": "error", "detail": "Invalid webhook payload"},
                status_code=400
            )

        # Process the webhook body to get processed events
        processed_events = process_webhook_body(body)

        msg = body.entry[0]

        print("msg:", json.dumps(msg.model_dump(), indent=4))

        # Convert msg.time (timestamp) to ISO 8601 string with timezone +0000
        if msg.time:
            created_time = datetime.datetime.fromtimestamp(msg.time / 1000).strftime("%Y-%m-%dT%H:%M:%S+0000")
        else:
            created_time = "0"

        processed_data = {
            "id": msg.messaging[0].message.mid or "unknown",
            "message": msg.messaging[0].message.text,
            "created_time": created_time,
            "from_name": msg.messaging[0].sender.name if msg.messaging[0].sender.name else "UNKNOWN",
            "from_id": msg.messaging[0].sender.id if msg.messaging[0].sender.id else "0000000000000999",
            "page_id": msg.id or "unknown",
        }

        if msg.messaging[0].message.attachments:
            processed_data["media_url"] = msg.messaging[0].message.attachments[0].payload.url
            processed_data["media_type"] = msg.messaging[0].message.attachments[0].type
            processed_data["type"] = "image"
        else:
            processed_data["media_url"] = None
            processed_data["media_type"] = None
            processed_data["type"] = "text"

        print("data:", json.dumps(processed_data, indent=4))

        if processed_data:
            queue.publish("facebook_inboxes", processed_data)
            logger.info(f"Published message to with data: {json.dumps(processed_data, indent=2)}")
        else:
            logger.info("No events to publish to queue")

        # Count the number of processed events for the response
        processed_events_count = len(processed_events)

        return JSONResponse(
            content={"status": "OK", "processed_events": processed_events_count},
            status_code=200
        )

    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid webhook payload: {str(e)}"
        )
    except HTTPException:
        raise
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error occurred: {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error occurred: {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Request error occurred: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Request error occurred: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error in webhook handler: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

