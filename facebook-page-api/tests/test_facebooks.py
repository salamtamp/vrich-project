import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException, Query
from httpx import HTTPStatusError, RequestError

from app.api.v1.endpoints.facebooks import (
    get_facebook_page_profile,
    get_facebook_page_posts,
    get_facebook_post_comments,
    FacebookPageProfileResponse,
    FacebookPostResponse,
    FacebookPostsResponse,
    FacebookCommentResponse,
    FacebookCommentsResponse,
)


class TestFacebookPageProfile:
    """Test cases for get_facebook_page_profile endpoint"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_get_facebook_page_profile_success(self, mock_settings):
        """Test successful Facebook page profile retrieval"""
        # Mock response data
        mock_response_data = {
            "id": "123456789",
            "name": "Test Facebook Page",
            "picture": {
                "data": {
                    "url": "https://example.com/profile.jpg"
                }
            }
        }

        # Mock httpx client
        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_page_profile(
                page_id="123456789",
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, FacebookPageProfileResponse)
            assert result.id == "123456789"
            assert result.name == "Test Facebook Page"
            assert result.picture == "https://example.com/profile.jpg"

            # Verify the API call
            mock_client.get.assert_called_once_with(
                "https://graph.facebook.com/v18.0/123456789",
                params={
                    "fields": "id,name,picture",
                    "access_token": "test_access_token"
                }
            )

    @pytest.mark.asyncio
    async def test_get_facebook_page_profile_no_picture(self, mock_settings):
        """Test Facebook page profile retrieval without picture"""
        mock_response_data = {
            "id": "123456789",
            "name": "Test Facebook Page"
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_page_profile(
                page_id="123456789",
                settings=mock_settings
            )

            assert result.picture is None

    @pytest.mark.asyncio
    async def test_get_facebook_page_profile_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error response"""
        mock_response_data = {
            "error": {
                "message": "Invalid access token",
                "type": "OAuthException",
                "code": 190
            }
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_page_profile(
                    page_id="123456789",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 400
            assert "Facebook API Error: Invalid access token" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_facebook_page_profile_http_error(self, mock_settings):
        """Test handling of HTTP error"""
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_response.text = "Page not found"

        mock_client = AsyncMock()
        mock_client.get.side_effect = HTTPStatusError(
            "404 Not Found",
            request=MagicMock(),
            response=mock_response
        )

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_page_profile(
                    page_id="123456789",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 404
            assert "HTTP error occurred" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_facebook_page_profile_request_error(self, mock_settings):
        """Test handling of request error"""
        mock_client = AsyncMock()
        mock_client.get.side_effect = RequestError("Connection failed")

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_page_profile(
                    page_id="123456789",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 500
            assert "Request error occurred" in str(exc_info.value.detail)


class TestFacebookPagePosts:
    """Test cases for get_facebook_page_posts endpoint"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_get_facebook_page_posts_success(self, mock_settings):
        """Test successful Facebook page posts retrieval"""
        mock_response_data = {
            "data": [
                {
                    "id": "post_123",
                    "created_time": "2023-12-01T10:00:00+0000",
                    "message": "Test post message",
                    "from": {"name": "Test Page"}
                },
                {
                    "id": "post_456",
                    "created_time": "2023-12-01T09:00:00+0000",
                    "message": "Another test post",
                    "from": {"name": "Test Page"}
                }
            ],
            "paging": {
                "next": "https://graph.facebook.com/v18.0/123456789/posts?after=next_token"
            }
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_page_posts(
                page_id="123456789",
                limit=20,
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, FacebookPostsResponse)
            assert len(result.data) == 2
            assert result.data[0].id == "post_123"
            assert result.data[0].message == "Test post message"
            assert result.data[0].from_user == "Test Page"
            assert result.paging == "https://graph.facebook.com/v18.0/123456789/posts?after=next_token"

            # Verify the API call - note that None values are not included in params
            mock_client.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_facebook_page_posts_with_filters(self, mock_settings):
        """Test Facebook page posts retrieval with date filters and pagination"""
        mock_response_data = {
            "data": [],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            await get_facebook_page_posts(
                page_id="123456789",
                since="2023-12-01",
                until="2023-12-31",
                limit=10,
                next_token="test_token",
                settings=mock_settings
            )

            # Verify the API call with all parameters
            mock_client.get.assert_called_once_with(
                "https://graph.facebook.com/v18.0/123456789/posts",
                params={
                    "access_token": "test_access_token",
                    "fields": "id,created_time,message,from",
                    "limit": 10,
                    "since": "2023-12-01",
                    "until": "2023-12-31",
                    "after": "test_token"
                }
            )

    @pytest.mark.asyncio
    async def test_get_facebook_page_posts_empty_response(self, mock_settings):
        """Test Facebook page posts retrieval with empty response"""
        mock_response_data = {
            "data": [],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_page_posts(
                page_id="123456789",
                settings=mock_settings
            )

            assert len(result.data) == 0
            assert result.paging is None

    @pytest.mark.asyncio
    async def test_get_facebook_page_posts_post_without_message(self, mock_settings):
        """Test handling of posts without message field"""
        mock_response_data = {
            "data": [
                {
                    "id": "post_123",
                    "created_time": "2023-12-01T10:00:00+0000",
                    "from": {"name": "Test Page"}
                }
            ],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_page_posts(
                page_id="123456789",
                settings=mock_settings
            )

            assert result.data[0].message is None

    @pytest.mark.asyncio
    async def test_get_facebook_page_posts_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error in posts endpoint"""
        mock_response_data = {
            "error": {
                "message": "Invalid page ID",
                "type": "OAuthException",
                "code": 100
            }
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_page_posts(
                    page_id="invalid_id",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 400
            assert "Facebook API Error: Invalid page ID" in str(exc_info.value.detail)


class TestFacebookPostComments:
    """Test cases for get_facebook_post_comments endpoint"""

    @pytest.fixture
    def mock_settings(self):
        """Mock settings with Facebook configuration"""
        mock_settings = MagicMock()
        mock_settings.FACEBOOK_BASE_URL = "https://graph.facebook.com/v18.0"
        mock_settings.FACEBOOK_PAGE_ACCESS_TOKEN = "test_access_token"
        return mock_settings

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_success(self, mock_settings):
        """Test successful Facebook post comments retrieval"""
        mock_response_data = {
            "data": [
                {
                    "id": "comment_123",
                    "created_time": "2023-12-01T10:30:00+0000",
                    "message": "Great post!",
                    "from": {"name": "John Doe"}
                },
                {
                    "id": "comment_456",
                    "created_time": "2023-12-01T10:35:00+0000",
                    "message": "Thanks for sharing",
                    "from": {"name": "Jane Smith"}
                }
            ],
            "paging": {
                "next": "https://graph.facebook.com/v18.0/post_123/comments?after=next_token"
            }
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_post_comments(
                post_id="post_123",
                next_token=None,  # Fixed: Remove Query(None)
                settings=mock_settings
            )

            # Verify the result
            assert isinstance(result, FacebookCommentsResponse)
            assert len(result.data) == 2
            assert result.data[0].id == "comment_123"
            assert result.data[0].message == "Great post!"
            assert result.data[0].from_user == "John Doe"  # This should match the implementation
            assert result.paging == "https://graph.facebook.com/v18.0/post_123/comments?after=next_token"

            # Verify the API call
            mock_client.get.assert_called_once_with(
                "https://graph.facebook.com/v18.0/post_123/comments",
                params={
                    "access_token": "test_access_token",
                    "fields": "id,from,message,created_time",
                    "order": "reverse_chronological",
                    "limit": 50,
                    "summary": "true"
                }
            )

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_with_pagination(self, mock_settings):
        """Test Facebook post comments retrieval with pagination token"""
        mock_response_data = {
            "data": [],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            await get_facebook_post_comments(
                post_id="post_123",
                next_token="test_token",
                settings=mock_settings
            )

            # Verify the API call with pagination
            mock_client.get.assert_called_once_with(
                "https://graph.facebook.com/v18.0/post_123/comments",
                params={
                    "access_token": "test_access_token",
                    "fields": "id,from,message,created_time",
                    "order": "reverse_chronological",
                    "limit": 50,
                    "summary": "true",
                    "after": "test_token"
                }
            )

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_empty_response(self, mock_settings):
        """Test Facebook post comments retrieval with empty response"""
        mock_response_data = {
            "data": [],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_post_comments(
                post_id="post_123",
                settings=mock_settings
            )

            assert len(result.data) == 0
            assert result.paging is None

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_comment_without_message(self, mock_settings):
        """Test handling of comments without message field"""
        mock_response_data = {
            "data": [
                {
                    "id": "comment_123",
                    "created_time": "2023-12-01T10:30:00+0000",
                    "from": {"name": "John Doe"}
                }
            ],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_post_comments(
                post_id="post_123",
                settings=mock_settings
            )

            assert result.data[0].message == ""  # Implementation returns empty string for missing message

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_comment_without_from(self, mock_settings):
        """Test handling of comments without from field"""
        mock_response_data = {
            "data": [
                {
                    "id": "comment_123",
                    "created_time": "2023-12-01T10:30:00+0000",
                    "message": "Test comment"
                }
            ],
            "paging": {}
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            result = await get_facebook_post_comments(
                post_id="post_123",
                settings=mock_settings
            )

            assert result.data[0].from_user == "UNKNOWN"  # Implementation returns "UNKNOWN" for missing from field

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_facebook_api_error(self, mock_settings):
        """Test handling of Facebook API error in comments endpoint"""
        mock_response_data = {
            "error": {
                "message": "Invalid post ID",
                "type": "OAuthException",
                "code": 100
            }
        }

        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()

        mock_client = AsyncMock()
        mock_client.get.return_value = mock_response

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_post_comments(
                    post_id="invalid_post_id",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 400
            assert "Facebook API Error: Invalid post ID" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_http_error(self, mock_settings):
        """Test handling of HTTP error in comments endpoint"""
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_response.text = "Forbidden"

        mock_client = AsyncMock()
        mock_client.get.side_effect = HTTPStatusError(
            "403 Forbidden",
            request=MagicMock(),
            response=mock_response
        )

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_post_comments(
                    post_id="post_123",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 403
            assert "HTTP error occurred" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_request_error(self, mock_settings):
        """Test handling of request error in comments endpoint"""
        mock_client = AsyncMock()
        mock_client.get.side_effect = RequestError("Network timeout")

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_post_comments(
                    post_id="post_123",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 500
            assert "Request error occurred" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_get_facebook_post_comments_unexpected_error(self, mock_settings):
        """Test handling of unexpected error in comments endpoint"""
        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("Unexpected error")

        with patch("app.api.v1.endpoints.facebooks.httpx.AsyncClient") as mock_async_client:
            mock_async_client.return_value.__aenter__.return_value = mock_client

            with pytest.raises(HTTPException) as exc_info:
                await get_facebook_post_comments(
                    post_id="post_123",
                    settings=mock_settings
                )

            assert exc_info.value.status_code == 500
            assert "Unexpected error" in str(exc_info.value.detail)


class TestResponseModels:
    """Test cases for Pydantic response models"""

    def test_facebook_page_profile_response(self):
        """Test FacebookPageProfileResponse model"""
        response = FacebookPageProfileResponse(
            id="123456789",
            name="Test Page",
            picture="https://example.com/picture.jpg"
        )

        assert response.id == "123456789"
        assert response.name == "Test Page"
        assert response.picture == "https://example.com/picture.jpg"

    def test_facebook_page_profile_response_no_picture(self):
        """Test FacebookPageProfileResponse model without picture"""
        response = FacebookPageProfileResponse(
            id="123456789",
            name="Test Page"
        )

        assert response.picture is None

    def test_facebook_post_response(self):
        """Test FacebookPostResponse model"""
        response = FacebookPostResponse(
            id="post_123",
            created_time="2023-12-01T10:00:00+0000",
            message="Test post",
            from_user="Test Page"
        )

        assert response.id == "post_123"
        assert response.created_time == "2023-12-01T10:00:00+0000"
        assert response.message == "Test post"
        assert response.from_user == "Test Page"

    def test_facebook_post_response_no_message(self):
        """Test FacebookPostResponse model without message"""
        response = FacebookPostResponse(
            id="post_123",
            created_time="2023-12-01T10:00:00+0000",
            from_user="Test Page"
        )

        assert response.message is None

    def test_facebook_posts_response(self):
        """Test FacebookPostsResponse model"""
        posts = [
            FacebookPostResponse(
                id="post_1",
                created_time="2023-12-01T10:00:00+0000",
                message="Post 1",
                from_user="Test Page"
            ),
            FacebookPostResponse(
                id="post_2",
                created_time="2023-12-01T11:00:00+0000",
                message="Post 2",
                from_user="Test Page"
            )
        ]

        response = FacebookPostsResponse(
            data=posts,
            paging="https://example.com/next"
        )

        assert len(response.data) == 2
        assert response.paging == "https://example.com/next"

    def test_facebook_comment_response(self):
        """Test FacebookCommentResponse model"""
        response = FacebookCommentResponse(
            id="comment_123",
            created_time="2023-12-01T10:30:00+0000",
            message="Great post!",
            from_user="John Doe"
        )

        assert response.id == "comment_123"
        assert response.created_time == "2023-12-01T10:30:00+0000"
        assert response.message == "Great post!"
        assert response.from_user == "John Doe"

    def test_facebook_comments_response(self):
        """Test FacebookCommentsResponse model"""
        comments = [
            FacebookCommentResponse(
                id="comment_1",
                created_time="2023-12-01T10:30:00+0000",
                message="Comment 1",
                from_user="User 1"
            ),
            FacebookCommentResponse(
                id="comment_2",
                created_time="2023-12-01T10:35:00+0000",
                message="Comment 2",
                from_user="User 2"
            )
        ]

        response = FacebookCommentsResponse(
            data=comments,
            paging="https://example.com/next"
        )

        assert len(response.data) == 2
        assert response.paging == "https://example.com/next"
