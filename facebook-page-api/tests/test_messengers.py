import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from httpx import HTTPStatusError, RequestError

from app.api.v1.endpoints.messengers import (
    format_text_message,
    format_image_message,
    format_template_message,
    send_facebook_text_message,
    send_facebook_image_message,
    send_facebook_template_message,
    send_text_message,
    send_image_message,
    send_template_message,
    send_message_batch,
    SendTextMessageRequest,
    SendImageMessageRequest,
    SendTemplateRequest,
    SendMessageBatchRequest,
    MessageTemplate,
    SendMessageResponse,
    BatchMessageResponse,
)


class TestMessageFormatting:
    """Test cases for message formatting functions"""

    def test_format_text_message(self):
        """Test formatting text message"""
        result = format_text_message("123456", "Hello, world!")

        expected = {
            "recipient": {"id": "123456"},
            "message": {"text": "Hello, world!"}
        }
        assert result == expected

    def test_format_image_message(self):
        """Test formatting image message"""
        result = format_image_message("123456", "https://example.com/image.jpg")

        expected = {
            "recipient": {"id": "123456"},
            "message": {
                "attachment": {
                    "type": "image",
                    "payload": {"url": "https://example.com/image.jpg"}
                }
            }
        }
        assert result == expected

    def test_format_template_message(self):
        """Test formatting template message"""
        template = MessageTemplate(
            template_type="generic",
            text="Test template",
            buttons=[{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
        )
        result = format_template_message("123456", template)

        expected = {
            "recipient": {"id": "123456"},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "text": "Test template",
                        "buttons": [{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
                    }
                }
            }
        }
        assert result == expected


class TestSendFacebookTextMessage:
    """Test cases for send_facebook_text_message function"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_send_facebook_text_message_success(self, mock_settings):
        """Test successful text message sending"""
        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_text_message(
                recipient_id="123456",
                message_text="Hello, world!",
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"
            assert result.error is None

            # Verify the API call
            mock_client.post.assert_called_once_with(
                "https://graph.facebook.com/v18.0/me/messages",
                json={
                    "recipient": {"id": "123456"},
                    "message": {"text": "Hello, world!"}
                },
                params={"access_token": "test_access_token"},
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

    @pytest.mark.asyncio
    async def test_send_facebook_text_message_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error response"""
        mock_response_data = {
            "error": {
                "message": "Invalid recipient ID",
                "type": "OAuthException",
                "code": 100
            }
        }

        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_text_message(
                recipient_id="invalid_id",
                message_text="Hello, world!",
                settings=mock_settings
            )

            assert result.success is False
            assert "Facebook API error: Invalid recipient ID" in result.error

    @pytest.mark.asyncio
    async def test_send_facebook_text_message_http_error(self, mock_settings):
        """Test handling of HTTP error"""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal server error"

        mock_client = AsyncMock()
        mock_client.post.side_effect = HTTPStatusError(
            "500 Internal Server Error",
            request=MagicMock(),
            response=mock_response
        )

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_text_message(
                recipient_id="123456",
                message_text="Hello, world!",
                settings=mock_settings
            )

            assert result.success is False
            assert "HTTP error" in result.error

    @pytest.mark.asyncio
    async def test_send_facebook_text_message_request_error(self, mock_settings):
        """Test handling of request error"""
        mock_client = AsyncMock()
        mock_client.post.side_effect = RequestError("Connection failed")

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_text_message(
                recipient_id="123456",
                message_text="Hello, world!",
                settings=mock_settings
            )

            assert result.success is False
            assert "Request error" in result.error

    @pytest.mark.asyncio
    async def test_send_facebook_text_message_unexpected_error(self, mock_settings):
        """Test handling of unexpected error"""
        mock_client = AsyncMock()
        mock_client.post.side_effect = Exception("Unexpected error")

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_text_message(
                recipient_id="123456",
                message_text="Hello, world!",
                settings=mock_settings
            )

            assert result.success is False
            assert "Unexpected error" in result.error


class TestSendFacebookImageMessage:
    """Test cases for send_facebook_image_message function"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_send_facebook_image_message_success(self, mock_settings):
        """Test successful image message sending"""
        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_image_message(
                recipient_id="123456",
                image_url="https://example.com/image.jpg",
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"
            assert result.error is None

            # Verify the API call
            mock_client.post.assert_called_once_with(
                "https://graph.facebook.com/v18.0/me/messages",
                json={
                    "recipient": {"id": "123456"},
                    "message": {
                        "attachment": {
                            "type": "image",
                            "payload": {"url": "https://example.com/image.jpg"}
                        }
                    }
                },
                params={"access_token": "test_access_token"},
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

    @pytest.mark.asyncio
    async def test_send_facebook_image_message_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error response"""
        mock_response_data = {
            "error": {
                "message": "Invalid image URL",
                "type": "OAuthException",
                "code": 100
            }
        }

        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_image_message(
                recipient_id="123456",
                image_url="invalid_url",
                settings=mock_settings
            )

            assert result.success is False
            assert "Facebook API error: Invalid image URL" in result.error


class TestSendFacebookTemplateMessage:
    """Test cases for send_facebook_template_message function"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_send_facebook_template_message_success(self, mock_settings):
        """Test successful template message sending"""
        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        template = MessageTemplate(
            template_type="generic",
            text="Test template",
            buttons=[{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
        )

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_template_message(
                recipient_id="123456",
                template=template,
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"
            assert result.error is None

            # Verify the API call
            mock_client.post.assert_called_once_with(
                "https://graph.facebook.com/v18.0/me/messages",
                json={
                    "recipient": {"id": "123456"},
                    "message": {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "text": "Test template",
                                "buttons": [{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
                            }
                        }
                    }
                },
                params={"access_token": "test_access_token"},
                headers={"Content-Type": "application/json"},
                timeout=30.0
            )

    @pytest.mark.asyncio
    async def test_send_facebook_template_message_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error response"""
        mock_response_data = {
            "error": {
                "message": "Invalid template",
                "type": "OAuthException",
                "code": 100
            }
        }

        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        template = MessageTemplate(
            template_type="invalid",
            text="Test template",
            buttons=[]
        )

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_facebook_template_message(
                recipient_id="123456",
                template=template,
                settings=mock_settings
            )

            assert result.success is False
            assert "Facebook API error: Invalid template" in result.error


class TestMessengerEndpoints:
    """Test cases for messenger API endpoints"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_send_text_message_endpoint_success(self, mock_settings):
        """Test successful text message endpoint"""
        request = SendTextMessageRequest(
            recipient_id="123456",
            message="Hello, world!"
        )

        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_text_message(request, mock_settings)

            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"

    @pytest.mark.asyncio
    async def test_send_image_message_endpoint_success(self, mock_settings):
        """Test successful image message endpoint"""
        request = SendImageMessageRequest(
            recipient_id="123456",
            image_url="https://example.com/image.jpg"
        )

        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_image_message(request, mock_settings)

            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"

    @pytest.mark.asyncio
    async def test_send_template_message_endpoint_success(self, mock_settings):
        """Test successful template message endpoint"""
        template = MessageTemplate(
            template_type="generic",
            text="Test template",
            buttons=[{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
        )
        request = SendTemplateRequest(
            recipient_id="123456",
            template=template
        )

        mock_response_data = {
            "message_id": "mid.123456789"
        }

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_template_message(request, mock_settings)

            assert isinstance(result, SendMessageResponse)
            assert result.success is True
            assert result.message_id == "mid.123456789"

    @pytest.mark.asyncio
    async def test_send_message_batch_success(self, mock_settings):
        """Test successful batch message sending"""
        messages = [
            SendTextMessageRequest(recipient_id="123456", message="Hello"),
            SendImageMessageRequest(recipient_id="789012", image_url="https://example.com/image.jpg")
        ]
        request = SendMessageBatchRequest(messages=messages)

        # Mock successful responses for both messages
        mock_response_data = {"message_id": "mid.123456789"}
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_response_data

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_message_batch(request, mock_settings)

            assert isinstance(result, BatchMessageResponse)
            assert result.total_messages == 2
            assert result.successful_messages == 2
            assert result.failed_messages == 0
            assert len(result.results) == 2

    @pytest.mark.asyncio
    async def test_send_message_batch_partial_failure(self, mock_settings):
        """Test batch message sending with partial failures"""
        messages = [
            SendTextMessageRequest(recipient_id="123456", message="Hello"),
            SendTextMessageRequest(recipient_id="invalid", message="Hello")
        ]
        request = SendMessageBatchRequest(messages=messages)

        # Mock mixed responses
        mock_client = AsyncMock()

        # First call succeeds
        success_response = MagicMock()
        success_response.status_code = 200
        success_response.json.return_value = {"message_id": "mid.123456789"}

        # Second call fails
        error_response = MagicMock()
        error_response.status_code = 400
        error_response.json.return_value = {"error": {"message": "Invalid recipient"}}

        mock_client.post.side_effect = [success_response, error_response]

        with patch("app.api.v1.endpoints.messengers.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await send_message_batch(request, mock_settings)

            assert isinstance(result, BatchMessageResponse)
            assert result.total_messages == 2
            assert result.successful_messages == 1
            assert result.failed_messages == 1
            assert len(result.results) == 2


class TestResponseModels:
    """Test cases for response models"""

    def test_send_message_response_success(self):
        """Test SendMessageResponse with success"""
        response = SendMessageResponse(
            success=True,
            message_id="mid.123456789"
        )

        assert response.success is True
        assert response.message_id == "mid.123456789"
        assert response.error is None

    def test_send_message_response_error(self):
        """Test SendMessageResponse with error"""
        response = SendMessageResponse(
            success=False,
            error="Test error message"
        )

        assert response.success is False
        assert response.message_id is None
        assert response.error == "Test error message"

    def test_batch_message_response(self):
        """Test BatchMessageResponse"""
        response = BatchMessageResponse(
            total_messages=3,
            successful_messages=2,
            failed_messages=1,
            results=[{"success": True}, {"success": False}, {"success": True}]
        )

        assert response.total_messages == 3
        assert response.successful_messages == 2
        assert response.failed_messages == 1
        assert len(response.results) == 3

    def test_message_template(self):
        """Test MessageTemplate model"""
        template = MessageTemplate(
            template_type="generic",
            text="Test template",
            buttons=[{"type": "web_url", "title": "Visit", "url": "https://example.com"}]
        )

        assert template.template_type == "generic"
        assert template.text == "Test template"
        assert len(template.buttons) == 1
        assert template.buttons[0]["type"] == "web_url"

    def test_send_text_message_request(self):
        """Test SendTextMessageRequest model"""
        request = SendTextMessageRequest(
            recipient_id="123456",
            message="Hello, world!"
        )

        assert request.recipient_id == "123456"
        assert request.message == "Hello, world!"

    def test_send_image_message_request(self):
        """Test SendImageMessageRequest model"""
        request = SendImageMessageRequest(
            recipient_id="123456",
            image_url="https://example.com/image.jpg"
        )

        assert request.recipient_id == "123456"
        assert request.image_url == "https://example.com/image.jpg"

    def test_send_template_request(self):
        """Test SendTemplateRequest model"""
        template = MessageTemplate(
            template_type="generic",
            text="Test template",
            buttons=[]
        )
        request = SendTemplateRequest(
            recipient_id="123456",
            template=template
        )

        assert request.recipient_id == "123456"
        assert request.template == template
