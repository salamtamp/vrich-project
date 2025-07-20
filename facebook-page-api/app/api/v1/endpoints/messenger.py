from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Union
import httpx
import logging
from app.core.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)

class SendTextMessageRequest(BaseModel):
    recipient_id: str = Field(..., description="Facebook user ID to send message to")
    message: str = Field(..., description="Text message to send")

class SendImageMessageRequest(BaseModel):
    recipient_id: str = Field(..., description="Facebook user ID to send image message to")
    image_url: str = Field(..., description="URL of the image to send")

class MessageTemplate(BaseModel):
    template_type: str = Field(..., description="Type of template (generic, button, etc.)")
    elements: list[Dict[str, Any]] = Field(..., description="Template elements")

class SendTemplateRequest(BaseModel):
    recipient_id: str = Field(..., description="Facebook user ID to send template to")
    template: MessageTemplate = Field(..., description="Message template")

class SendMessageBatchRequest(BaseModel):
    messages: list[Union[SendTextMessageRequest, SendImageMessageRequest, SendTemplateRequest]] = Field(..., description="List of messages to send")

class SendMessageResponse(BaseModel):
    success: bool
    message_id: Optional[str] = None
    error: Optional[str] = None


def format_text_message(recipient_id: str, message_text: str) -> Dict[str, Any]:
    """Format a text message for Facebook Messenger API."""
    return {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text}
    }

def format_image_message(recipient_id: str, image_url: str) -> Dict[str, Any]:
    """Format an image message for Facebook Messenger API."""
    return {
        "recipient": {"id": recipient_id},
        "message": {"attachment": {"type": "image", "payload": {"url": image_url}}}
    }

def format_template_message(recipient_id: str, template: MessageTemplate) -> Dict[str, Any]:
    """Format a template message for Facebook Messenger API."""
    return {
        "recipient": {"id": recipient_id},
        "message": {
            "attachment": {
                "type": "template",
                "payload": template.model_dump()
            }
        }
    }

async def send_facebook_text_message(
    recipient_id: str,
    message_text: str,
    settings = None
) -> SendMessageResponse:
    """
    Send a message via Facebook Messenger API.

    Args:
        recipient_id: The Facebook user ID to send the message to
        message_text: The text message to send
        page_id: Optional page ID, uses default if not provided
        settings: Application settings

    Returns:
        SendMessageResponse with success status and message ID or error
    """
    if not settings:
        settings = get_settings()


    # Facebook Messenger API endpoint
    url = f"{settings.FACEBOOK_BASE_URL}/me/messages"

    # Prepare the message payload
    payload = format_text_message(recipient_id, message_text)

    # Query parameters
    params = {
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN
    }

    try:
        logger.info(f"Sending message to recipient {recipient_id}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                params=params,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

            response_data = response.json()

            if response.status_code == 200:
                message_id = response_data.get("message_id")
                logger.info(f"Message sent successfully. Message ID: {message_id}")
                return SendMessageResponse(
                    success=True,
                    message_id=message_id
                )
            else:
                error_message = response_data.get("error", {}).get("message", "Unknown error")
                logger.error(f"Facebook API error: {error_message}")
                return SendMessageResponse(
                    success=False,
                    error=f"Facebook API error: {error_message}"
                )

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error sending message: {e.response.text}")
        return SendMessageResponse(
            success=False,
            error=f"HTTP error: {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Request error sending message: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Request error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error sending message: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )

async def send_facebook_template_message(
    recipient_id: str,
    template: MessageTemplate,
    settings = None
) -> SendMessageResponse:
    """
    Send a template message via Facebook Messenger API.

    Args:
        recipient_id: The Facebook user ID to send the template to
        template: The message template to send
        page_id: Optional page ID, uses default if not provided
        settings: Application settings

    Returns:
        SendMessageResponse with success status and message ID or error
    """
    if not settings:
        settings = get_settings()

    # Facebook Messenger API endpoint
    url = f"{settings.FACEBOOK_BASE_URL}/me/messages"

    # Prepare the template payload
    payload = format_template_message(recipient_id, template)

    # Query parameters
    params = {
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN
    }

    try:
        logger.info(f"Sending template message to recipient {recipient_id}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                params=params,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

            response_data = response.json()

            if response.status_code == 200:
                message_id = response_data.get("message_id")
                logger.info(f"Template message sent successfully. Message ID: {message_id}")
                return SendMessageResponse(
                    success=True,
                    message_id=message_id
                )
            else:
                error_message = response_data.get("error", {}).get("message", "Unknown error")
                logger.error(f"Facebook API error sending template: {error_message}")
                return SendMessageResponse(
                    success=False,
                    error=f"Facebook API error: {error_message}"
                )

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error sending template: {e.response.text}")
        return SendMessageResponse(
            success=False,
            error=f"HTTP error: {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Request error sending template: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Request error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error sending template: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )

async def send_facebook_image_message(
    recipient_id: str,
    image_url: str,
    settings = None
) -> SendMessageResponse:
    """
    Send an image message via Facebook Messenger API.

    Args:
        recipient_id: The Facebook user ID to send the image to
        image_url: The URL of the image to send
        page_id: Optional page ID, uses default if not provided
        settings: Application settings

    Returns:
        SendMessageResponse with success status and message ID or error
    """
    if not settings:
        settings = get_settings()

    # Facebook Messenger API endpoint
    url = f"{settings.FACEBOOK_BASE_URL}/me/messages"

    # Prepare the image payload
    payload = format_image_message(recipient_id, image_url)

    # Query parameters
    params = {
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN
    }

    try:
        logger.info(f"Sending image message to recipient {recipient_id}")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                params=params,
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

            response_data = response.json()

            if response.status_code == 200:
                message_id = response_data.get("message_id")
                logger.info(f"Image message sent successfully. Message ID: {message_id}")
                return SendMessageResponse(
                    success=True,
                    message_id=message_id
                )
            else:
                error_message = response_data.get("error", {}).get("message", "Unknown error")
                logger.error(f"Facebook API error sending image: {error_message}")
                return SendMessageResponse(
                    success=False,
                    error=f"Facebook API error: {error_message}"
                )

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error sending image: {e.response.text}")
        return SendMessageResponse(
            success=False,
            error=f"HTTP error: {e.response.text}"
        )
    except httpx.RequestError as e:
        logger.error(f"Request error sending image: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Request error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error sending image: {str(e)}")
        return SendMessageResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )

@router.post("/send-text-message", response_model=SendMessageResponse)
async def send_text_message(
    request: SendTextMessageRequest,
    settings = Depends(get_settings)
):
    """
    Send a Facebook Messenger message to a specific user.

    This endpoint allows sending text messages to Facebook users via the Messenger API.
    The message will be sent from the configured Facebook page.
    """
    logger.info(f"Received send message request for recipient: {request.recipient_id}")

    result = await send_facebook_text_message(
        recipient_id=request.recipient_id,
        message_text=request.message,
        settings=settings
    )

    if not result.success:
        raise HTTPException(
            status_code=400,
            detail=result.error
        )

    return result


@router.post("/send-image-message", response_model=SendMessageResponse)
async def send_image_message(
    request: SendImageMessageRequest,
    settings = Depends(get_settings)
):
    """
    Send an image message via Facebook Messenger API.

    This endpoint allows sending image messages to Facebook users via the Messenger API.
    The image will be sent from the configured Facebook page.
    """
    logger.info(f"Received send image message request for recipient: {request.recipient_id}")

    result = await send_facebook_image_message(
        recipient_id=request.recipient_id,
        image_url=request.image_url,
        settings=settings
    )

    if not result.success:
        raise HTTPException(
            status_code=400,
            detail=result.error
        )

    return result

@router.post("/send-template-message", response_model=SendMessageResponse)
async def send_template_message(
    request: SendTemplateRequest,
    settings = Depends(get_settings)
):
    """
    Send a Facebook Messenger template message to a specific user.

    This endpoint allows sending template messages (generic templates, buttons, etc.)
    to Facebook users via the Messenger API.
    """
    logger.info(f"Received send template request for recipient: {request.recipient_id}")

    result = await send_facebook_template_message(
        recipient_id=request.recipient_id,
        template=request.template,
        settings=settings
    )

    if not result.success:
        raise HTTPException(
            status_code=400,
            detail=result.error
        )

    return result

@router.post("/send-message-batch")
async def send_message_batch(
    request: SendMessageBatchRequest,
    settings = Depends(get_settings)
):
    """
    Send multiple Facebook Messenger messages in batch.

    This endpoint allows sending multiple text messages to different users.
    Each message will be processed individually and results will be returned for each.
    """
    logger.info(f"Received batch send message request for {len(request.messages)} recipients")

    results = []
    for i, request in enumerate(request.messages):
        logger.info(f"Processing message {i+1}/{len(request.messages)} for recipient: {request.recipient_id}")

        if isinstance(request, SendTextMessageRequest):
            result = await send_facebook_text_message(
                recipient_id=request.recipient_id,
                message_text=request.message,
                settings=settings
            )
        elif isinstance(request, SendImageMessageRequest):
            result = await send_facebook_image_message(
                recipient_id=request.recipient_id,
                image_url=request.image_url,
                settings=settings
            )
        elif isinstance(request, SendTemplateRequest):
            result = await send_facebook_template_message(
                recipient_id=request.recipient_id,
                template=request.template,
                settings=settings
            )

        results.append({
            "index": i,
            "recipient_id": request.recipient_id,
            "success": result.success,
            "message_id": result.message_id,
            "error": result.error
        })

    return {
        "total_messages": len(request.messages),
        "successful_messages": sum(1 for r in results if r["success"]),
        "failed_messages": sum(1 for r in results if not r["success"]),
        "results": results
    }