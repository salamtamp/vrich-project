from app.core.config import get_settings
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union
import json
import logging

import httpx

router = APIRouter()
logger = logging.getLogger(__name__)

class FacebookSender(BaseModel):
    id: str

class FacebookMessageAttachment(BaseModel):
    type: str
    payload: Dict[str, Any]

class FacebookMessage(BaseModel):
    text: Optional[str] = None
    attachments: Optional[List[FacebookMessageAttachment]] = None

class FacebookMessagingEvent(BaseModel):
    sender: FacebookSender
    message: Optional[FacebookMessage] = None
    timestamp: Optional[int] = None

class FacebookEntry(BaseModel):
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


def process_text_message(sender_id: str, message: FacebookMessage, timestamp: Optional[int]) -> None:
    if not message.text:
        return

    formatted_message = format_text_message(sender_id, message.text)

    log_data = {
        "event": "text_message",
        "sender_id": sender_id,
        "message_data": formatted_message,
        "timestamp": timestamp
    }

    logger.info("Text message received", extra=log_data)
    print(json.dumps(log_data, indent=2))


def process_media_message(sender_id: str, message: FacebookMessage, timestamp: Optional[int]) -> None:
    if not message.attachments:
        return

    ALLOWED_MEDIA_TYPES = {"image", "video", "audio", "file"}

    for attachment in message.attachments:
        attachment_type = attachment.type

        if attachment_type in ALLOWED_MEDIA_TYPES:
            media_url = attachment.payload.get("url")
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
        else:
            log_data = {
                "event": "unsupported_attachment_type",
                "sender_id": sender_id,
                "message_data": message.dict(),
                "timestamp": timestamp
            }

            logger.warning(f"Unsupported attachment type: {attachment_type}", extra=log_data)
            print(json.dumps(log_data, indent=2))


def process_messaging_event(messaging_event: FacebookMessagingEvent) -> None:
    sender_id = messaging_event.sender.id
    message = messaging_event.message
    timestamp = messaging_event.timestamp

    if not message:
        return

    # Process text messages
    if message.attachments:
        process_media_message(sender_id, message, timestamp)
    elif message.text:
        process_text_message(sender_id, message, timestamp)
    else:
        log_data = {
            "event": "unsupported_message_type",
            "sender_id": sender_id,
            "message_data": message.dict(),
            "timestamp": timestamp
        }

        logger.warning("Unsupported message type", extra=log_data)
        print(json.dumps(log_data, indent=2))

def process_webhook_body(body: FacebookWebhookBody) -> None:
    if body.object != "page":
        logger.warning(f"Received webhook for object type: {body.object}")
        return

    for entry in body.entry:
        for messaging_event in entry.messaging:
            try:
                process_messaging_event(messaging_event)
            except Exception as e:
                logger.error(f"Error processing messaging event: {e}", exc_info=True)


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
    try:
        body_data = await request.json()
        body = FacebookWebhookBody(**body_data)

        process_webhook_body(body)

        return JSONResponse(
            content={"status": "OK"},
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

