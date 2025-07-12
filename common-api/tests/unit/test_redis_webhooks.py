import json
from unittest.mock import AsyncMock, patch

import pytest

from app.utils.redis import RedisClient


@pytest.fixture
def redis_client():
    return RedisClient()


@pytest.mark.asyncio
async def test_store_webhook_data(redis_client):
    """Test storing webhook data in Redis."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        mock_redis.lrange.return_value = []
        mock_redis.lrem.return_value = 0
        mock_redis.lpush.return_value = 1
        mock_redis.ltrim.return_value = True
        mock_redis.expire.return_value = True

        await redis_client.connect()

        test_data = {"id": "123", "content": "test post"}
        await redis_client.store_webhook_data("posts", "123", test_data)

        # Verify Redis operations were called
        mock_redis.setex.assert_called_once()
        mock_redis.lpush.assert_called_once()
        mock_redis.ltrim.assert_called_once()
        mock_redis.expire.assert_called_once()


@pytest.mark.asyncio
async def test_get_webhook_data(redis_client):
    """Test retrieving webhook data from Redis."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        test_data = {
            "id": "123",
            "content": "test post",
            "cached_at": "2024-01-01T00:00:00",
        }
        mock_redis.get.return_value = json.dumps(test_data)

        await redis_client.connect()

        result = await redis_client.get_webhook_data("posts", "123")

        assert result == test_data
        mock_redis.get.assert_called_once_with("webhook:posts:123")


@pytest.mark.asyncio
async def test_get_recent_webhook_data(redis_client):
    """Test retrieving recent webhook data."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        mock_redis.lrange.return_value = ["123", "456"]

        # Mock get_webhook_data method
        with patch.object(redis_client, "get_webhook_data") as mock_get_data:
            mock_get_data.side_effect = [
                {"id": "123", "content": "test post 1"},
                {"id": "456", "content": "test post 2"},
            ]

            await redis_client.connect()

            result = await redis_client.get_recent_webhook_data("posts", 2)

            assert len(result) == 2
            assert result[0]["id"] == "123"
            assert result[1]["id"] == "456"


@pytest.mark.asyncio
async def test_clear_webhook_data(redis_client):
    """Test clearing specific webhook data."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        mock_redis.delete.return_value = 1
        mock_redis.lrem.return_value = 1

        await redis_client.connect()

        result = await redis_client.clear_webhook_data("posts", "123")

        assert result is True
        mock_redis.delete.assert_called_once_with("webhook:posts:123")
        mock_redis.lrem.assert_called_once_with("webhook:posts:list", 0, "123")


@pytest.mark.asyncio
async def test_clear_all_webhook_data(redis_client):
    """Test clearing all webhook data for a type."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        mock_redis.lrange.return_value = ["123", "456"]
        mock_redis.delete.return_value = 1

        await redis_client.connect()

        result = await redis_client.clear_all_webhook_data("posts")

        assert result is True
        # Should delete each item and the list
        assert mock_redis.delete.call_count == 3  # 2 items + 1 list


@pytest.mark.asyncio
async def test_redis_connection_failure(redis_client):
    """Test handling Redis connection failure."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis connection failure
        mock_redis.ping.side_effect = Exception("Connection failed")

        with pytest.raises(Exception, match="Connection failed"):
            await redis_client.connect()


@pytest.mark.asyncio
async def test_store_webhook_data_with_existing_items(redis_client):
    """Test storing webhook data when list already has items."""
    with patch("app.utils.redis.redis.Redis") as mock_redis_class:
        mock_redis = AsyncMock()
        mock_redis_class.return_value = mock_redis

        # Mock Redis operations
        mock_redis.ping.return_value = True
        # Simulate existing items in the list
        mock_redis.lrange.return_value = ["123", "456", "789"]
        mock_redis.lrem.return_value = 0
        mock_redis.lpush.return_value = 1
        mock_redis.ltrim.return_value = True
        mock_redis.expire.return_value = True

        await redis_client.connect()

        test_data = {"id": "999", "content": "new post"}
        await redis_client.store_webhook_data("posts", "999", test_data)

        # Verify the new item was added and list was trimmed
        mock_redis.lpush.assert_called_once_with("webhook:posts:list", "999")
        mock_redis.ltrim.assert_called_once_with(
            "webhook:posts:list", 0, 9
        )  # MAX_ITEMS_PER_TYPE - 1
