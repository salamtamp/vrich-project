import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.testclient import TestClient
from httpx import HTTPStatusError, RequestError

from app.api.v1.endpoints.webhooks import (
    verify_webhook,
    handle_webhook,
    process_webhook_body,
    process_messaging_event,
    process_text_message,
    process_media_message,
    format_text_message,
    format_media_message,
    FacebookWebhookBody,
    FacebookEntry,
    FacebookMessagingEvent,
    FacebookSender,
    FacebookMessage,
    FacebookMessageAttachment,
)
from app.main import app


class TestWebhookVerification:
    """Test cases for webhook verification endpoint"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_INBOX_VERIFY_TOKEN = "test_verify_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_verify_webhook_success(self, mock_settings):
        """Test successful webhook verification"""
        with patch("app.api.v1.endpoints.webhooks.get_settings", return_value=mock_settings):
            response = await verify_webhook(
                hub_mode="subscribe",
                hub_verify_token="test_verify_token",
                hub_challenge="test_challenge"
            )

            assert response.status_code == 200
            assert response.body.decode() == "test_challenge"

    @pytest.mark.asyncio
    async def test_verify_webhook_wrong_mode(self, mock_settings):
        """Test webhook verification with wrong mode"""
        with patch("app.api.v1.endpoints.webhooks.get_settings", return_value=mock_settings):
            response = await verify_webhook(
                hub_mode="wrong_mode",
                hub_verify_token="test_verify_token",
                hub_challenge="test_challenge"
            )

            assert response.status_code == 403
            assert response.body.decode() == "Verification failed"

    @pytest.mark.asyncio
    async def test_verify_webhook_wrong_token(self, mock_settings):
        """Test webhook verification with wrong token"""
        with patch("app.api.v1.endpoints.webhooks.get_settings", return_value=mock_settings):
            response = await verify_webhook(
                hub_mode="subscribe",
                hub_verify_token="wrong_token",
                hub_challenge="test_challenge"
            )

            assert response.status_code == 403
            assert response.body.decode() == "Verification failed"


class TestWebhookMessageProcessing:
    """Test cases for webhook message processing functions"""

    def test_format_text_message(self):
        """Test formatting text message"""
        result = format_text_message("123456", "Hello, world!")

        expected = {
            "recipient": {"id": "123456"},
            "message": {"text": "Hello, world!"}
        }
        assert result == expected

    def test_format_media_message(self):
        """Test formatting media message"""
        result = format_media_message(
            recipient_id="123456",
            media_type="image",
            media_url="https://example.com/image.jpg",
            is_reusable=True
        )

        expected = {
            "recipient": {"id": "123456"},
            "message": {
                "attachment": {
                    "type": "image",
                    "payload": {
                        "url": "https://example.com/image.jpg",
                        "is_reusable": True
                    }
                }
            }
        }
        assert result == expected

    def test_format_media_message_default_reusable(self):
        """Test formatting media message with default is_reusable"""
        result = format_media_message(
            recipient_id="123456",
            media_type="video",
            media_url="https://example.com/video.mp4"
        )

        assert result["message"]["attachment"]["payload"]["is_reusable"] is False

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_text_message(self, mock_logger):
        """Test processing text message"""
        message = FacebookMessage(text="Hello, world!")

        process_text_message("123456", message, 1234567890)

        # Verify logger was called
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args
        assert call_args[0][0] == "Text message received"
        assert call_args[1]["extra"]["event"] == "text_message"
        assert call_args[1]["extra"]["sender_id"] == "123456"
        assert call_args[1]["extra"]["timestamp"] == 1234567890

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_text_message_no_text(self, mock_logger):
        """Test processing text message with no text"""
        message = FacebookMessage(text=None)

        process_text_message("123456", message, 1234567890)

        # Verify logger was not called
        mock_logger.info.assert_not_called()

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_media_message_image(self, mock_logger):
        """Test processing media message with image"""
        attachment = FacebookMessageAttachment(
            type="image",
            payload={"url": "https://example.com/image.jpg"}
        )
        message = FacebookMessage(attachments=[attachment])

        process_media_message("123456", message, 1234567890)

        # Verify logger was called
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args
        assert "Media message received: image" in call_args[0][0]
        assert call_args[1]["extra"]["event"] == "media_message"
        assert call_args[1]["extra"]["sender_id"] == "123456"

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_media_message_video(self, mock_logger):
        """Test processing media message with video"""
        attachment = FacebookMessageAttachment(
            type="video",
            payload={"url": "https://example.com/video.mp4"}
        )
        message = FacebookMessage(attachments=[attachment])

        process_media_message("123456", message, 1234567890)

        # Verify logger was called
        mock_logger.info.assert_called_once()
        call_args = mock_logger.info.call_args
        assert "Media message received: video" in call_args[0][0]

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_media_message_no_attachments(self, mock_logger):
        """Test processing media message with no attachments"""
        message = FacebookMessage(attachments=None)

        process_media_message("123456", message, 1234567890)

        # Verify logger was not called
        mock_logger.info.assert_not_called()

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_media_message_no_url(self, mock_logger):
        """Test processing media message with no URL"""
        attachment = FacebookMessageAttachment(
            type="image",
            payload={}
        )
        message = FacebookMessage(attachments=[attachment])

        process_media_message("123456", message, 1234567890)

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        assert "No URL found for image attachment" in mock_logger.warning.call_args[0][0]

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_media_message_unsupported_type(self, mock_logger):
        """Test processing media message with unsupported type"""
        attachment = FacebookMessageAttachment(
            type="unsupported",
            payload={"url": "https://example.com/file.xyz"}
        )
        message = FacebookMessage(attachments=[attachment])

        process_media_message("123456", message, 1234567890)

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        assert "Unsupported attachment type: unsupported" in mock_logger.warning.call_args[0][0]

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_messaging_event_text(self, mock_logger):
        """Test processing messaging event with text message"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )

        with patch("app.api.v1.endpoints.webhooks.process_text_message") as mock_process:
            process_messaging_event(event)

            mock_process.assert_called_once_with("123456", message, 1234567890)

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_messaging_event_media(self, mock_logger):
        """Test processing messaging event with media message"""
        sender = FacebookSender(id="123456")
        attachment = FacebookMessageAttachment(
            type="image",
            payload={"url": "https://example.com/image.jpg"}
        )
        message = FacebookMessage(attachments=[attachment])
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )

        with patch("app.api.v1.endpoints.webhooks.process_media_message") as mock_process:
            process_messaging_event(event)

            mock_process.assert_called_once_with("123456", message, 1234567890)

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_messaging_event_no_message(self, mock_logger):
        """Test processing messaging event with no message"""
        sender = FacebookSender(id="123456")
        event = FacebookMessagingEvent(
            sender=sender,
            message=None,
            timestamp=1234567890
        )

        with patch("app.api.v1.endpoints.webhooks.process_text_message") as mock_text_process:
            with patch("app.api.v1.endpoints.webhooks.process_media_message") as mock_media_process:
                process_messaging_event(event)

                # Verify neither processing function was called
                mock_text_process.assert_not_called()
                mock_media_process.assert_not_called()

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_messaging_event_unsupported_type(self, mock_logger):
        """Test processing messaging event with unsupported message type"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage()  # No text or attachments
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )

        process_messaging_event(event)

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        assert "Unsupported message type" in mock_logger.warning.call_args[0][0]

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_webhook_body_page_object(self, mock_logger):
        """Test processing webhook body with page object"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )
        entry = FacebookEntry(messaging=[event])
        body = FacebookWebhookBody(object="page", entry=[entry])

        with patch("app.api.v1.endpoints.webhooks.process_messaging_event") as mock_process:
            process_webhook_body(body)

            mock_process.assert_called_once_with(event)

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_webhook_body_non_page_object(self, mock_logger):
        """Test processing webhook body with non-page object"""
        body = FacebookWebhookBody(object="user", entry=[])

        with patch("app.api.v1.endpoints.webhooks.process_messaging_event") as mock_process:
            process_webhook_body(body)

            # Verify warning was logged
            mock_logger.warning.assert_called_once()
            assert "Received webhook for object type: user" in mock_logger.warning.call_args[0][0]

            # Verify processing was not called
            mock_process.assert_not_called()

    @patch("app.api.v1.endpoints.webhooks.logger")
    def test_process_webhook_body_processing_error(self, mock_logger):
        """Test processing webhook body with processing error"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )
        entry = FacebookEntry(messaging=[event])
        body = FacebookWebhookBody(object="page", entry=[entry])

        with patch("app.api.v1.endpoints.webhooks.process_messaging_event") as mock_process:
            mock_process.side_effect = Exception("Processing error")

            process_webhook_body(body)

            # Verify error was logged
            mock_logger.error.assert_called_once()
            assert "Error processing messaging event" in mock_logger.error.call_args[0][0]


class TestWebhookHandler:
    """Test cases for webhook handler endpoint"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    def test_handle_webhook_success(self, client):
        """Test successful webhook handling"""
        webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            "message": {"text": "Hello, world!"},
                            "timestamp": 1234567890
                        }
                    ]
                }
            ]
        }

        with patch("app.api.v1.endpoints.webhooks.process_webhook_body") as mock_process:
            response = client.post("/api/v1/webhook/", json=webhook_data)

            assert response.status_code == 200
            assert response.json() == {"status": "OK"}
            mock_process.assert_called_once()

    def test_handle_webhook_invalid_payload(self, client):
        """Test webhook handling with invalid payload"""
        invalid_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            # Missing required fields
                        }
                    ]
                }
            ]
        }

        response = client.post("/api/v1/webhook/", json=invalid_data)

        assert response.status_code == 400
        assert "Invalid webhook payload" in response.json()["detail"]

    def test_handle_webhook_malformed_json(self, client):
        """Test webhook handling with malformed JSON"""
        response = client.post(
            "/api/v1/webhook/",
            content="invalid json",
            headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 400
        assert "Invalid webhook payload" in response.json()["detail"]

    def test_handle_webhook_processing_error(self, client):
        """Test webhook handling with processing error"""
        webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            "message": {"text": "Hello, world!"},
                            "timestamp": 1234567890
                        }
                    ]
                }
            ]
        }

        with patch("app.api.v1.endpoints.webhooks.process_webhook_body") as mock_process:
            mock_process.side_effect = Exception("Unexpected error")

            response = client.post("/api/v1/webhook/", json=webhook_data)

            assert response.status_code == 500
            assert "Unexpected error" in response.json()["detail"]


class TestWebhookIntegration:
    """Integration tests for webhook endpoints"""

    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)

    def test_webhook_verification_integration(self, client):
        """Test webhook verification integration"""
        with patch("app.api.v1.endpoints.webhooks.get_settings") as mock_get_settings:
            mock_settings = MagicMock()
            mock_settings.FACEBOOK_INBOX_VERIFY_TOKEN = "test_verify_token"
            mock_get_settings.return_value = mock_settings

            response = client.get(
                "/api/v1/webhook/",
                params={
                    "hub.mode": "subscribe",
                    "hub.verify_token": "test_verify_token",
                    "hub.challenge": "test_challenge"
                }
            )

            assert response.status_code == 200
            assert response.text == "test_challenge"

    def test_webhook_handling_integration(self, client):
        """Test webhook handling integration"""
        webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            "message": {"text": "Hello, world!"},
                            "timestamp": 1234567890
                        }
                    ]
                }
            ]
        }

        response = client.post("/api/v1/webhook/", json=webhook_data)

        assert response.status_code == 200
        assert response.json() == {"status": "OK"}

    def test_webhook_with_media_message_integration(self, client):
        """Test webhook handling with media message integration"""
        webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            "message": {
                                "attachments": [
                                    {
                                        "type": "image",
                                        "payload": {
                                            "url": "https://example.com/image.jpg"
                                        }
                                    }
                                ]
                            },
                            "timestamp": 1234567890
                        }
                    ]
                }
            ]
        }

        response = client.post("/api/v1/webhook/", json=webhook_data)

        assert response.status_code == 200
        assert response.json() == {"status": "OK"}

    def test_webhook_with_multiple_messages_integration(self, client):
        """Test webhook handling with multiple messages integration"""
        webhook_data = {
            "object": "page",
            "entry": [
                {
                    "messaging": [
                        {
                            "sender": {"id": "123456"},
                            "message": {"text": "First message"},
                            "timestamp": 1234567890
                        },
                        {
                            "sender": {"id": "789012"},
                            "message": {"text": "Second message"},
                            "timestamp": 1234567891
                        }
                    ]
                }
            ]
        }

        response = client.post("/api/v1/webhook/", json=webhook_data)

        assert response.status_code == 200
        assert response.json() == {"status": "OK"}


class TestWebhookModels:
    """Test cases for webhook Pydantic models"""

    def test_facebook_sender_model(self):
        """Test FacebookSender model"""
        sender = FacebookSender(id="123456")
        assert sender.id == "123456"

    def test_facebook_message_attachment_model(self):
        """Test FacebookMessageAttachment model"""
        attachment = FacebookMessageAttachment(
            type="image",
            payload={"url": "https://example.com/image.jpg"}
        )
        assert attachment.type == "image"
        assert attachment.payload["url"] == "https://example.com/image.jpg"

    def test_facebook_message_model_text_only(self):
        """Test FacebookMessage model with text only"""
        message = FacebookMessage(text="Hello, world!")
        assert message.text == "Hello, world!"
        assert message.attachments is None

    def test_facebook_message_model_attachments_only(self):
        """Test FacebookMessage model with attachments only"""
        attachment = FacebookMessageAttachment(
            type="image",
            payload={"url": "https://example.com/image.jpg"}
        )
        message = FacebookMessage(attachments=[attachment])
        assert message.text is None
        assert len(message.attachments) == 1
        assert message.attachments[0].type == "image"

    def test_facebook_messaging_event_model(self):
        """Test FacebookMessagingEvent model"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )
        assert event.sender.id == "123456"
        assert event.message.text == "Hello, world!"
        assert event.timestamp == 1234567890

    def test_facebook_entry_model(self):
        """Test FacebookEntry model"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )
        entry = FacebookEntry(messaging=[event])
        assert len(entry.messaging) == 1
        assert entry.messaging[0].sender.id == "123456"

    def test_facebook_webhook_body_model(self):
        """Test FacebookWebhookBody model"""
        sender = FacebookSender(id="123456")
        message = FacebookMessage(text="Hello, world!")
        event = FacebookMessagingEvent(
            sender=sender,
            message=message,
            timestamp=1234567890
        )
        entry = FacebookEntry(messaging=[event])
        body = FacebookWebhookBody(object="page", entry=[entry])
        assert body.object == "page"
        assert len(body.entry) == 1
        assert len(body.entry[0].messaging) == 1