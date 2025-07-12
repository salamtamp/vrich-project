import json
import logging
from datetime import datetime, timedelta
from typing import Any

import redis.asyncio as redis

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisClient:
    def __init__(self):
        self.redis_client: redis.Redis | None = None
        self.TTL_DAYS = 7
        self.MAX_ITEMS_PER_TYPE = 10

    async def connect(self) -> None:
        """Connect to Redis server."""
        try:
            # Only set password if it's not empty
            password = (
                settings.REDIS_PASSWORD
                if settings.REDIS_PASSWORD and settings.REDIS_PASSWORD.strip()
                else None
            )

            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                password=password,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
            )
            # Test connection
            await self.redis_client.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self) -> None:
        """Disconnect from Redis server."""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Disconnected from Redis")

    async def _ensure_connection(self) -> None:
        """Ensure Redis connection is active."""
        if not self.redis_client:
            await self.connect()
        try:
            await self.redis_client.ping()
        except Exception:
            logger.warning("Redis connection lost, reconnecting...")
            await self.connect()

    def _get_cache_key(self, data_type: str, item_id: str) -> str:
        """Generate cache key for a specific item."""
        return f"webhook:{data_type}:{item_id}"

    def _get_list_key(self, data_type: str) -> str:
        """Generate cache key for the list of items of a specific type."""
        return f"webhook:{data_type}:list"

    async def store_webhook_data(
        self, data_type: str, item_id: str, data: dict[str, Any]
    ) -> None:
        """
        Store webhook data in Redis with TTL and maintain list of recent items.

        Args:
            data_type: Type of webhook data (posts, comments, inboxes)
            item_id: Unique identifier for the item
            data: Data to store
        """
        try:
            await self._ensure_connection()

            # Add timestamp to data
            data_with_timestamp = {
                **data,
                "cached_at": datetime.utcnow().isoformat(),
                "item_id": item_id,
            }

            # Store the item data
            item_key = self._get_cache_key(data_type, item_id)
            await self.redis_client.setex(
                item_key, timedelta(days=self.TTL_DAYS), json.dumps(data_with_timestamp)
            )

            # Update the list of recent items
            list_key = self._get_list_key(data_type)

            # Get current list
            current_list = await self.redis_client.lrange(list_key, 0, -1)

            # Remove item if it already exists in the list
            if item_id in current_list:
                await self.redis_client.lrem(list_key, 0, item_id)

            # Add new item to the beginning of the list
            await self.redis_client.lpush(list_key, item_id)

            # Trim list to keep only the most recent MAX_ITEMS_PER_TYPE items
            await self.redis_client.ltrim(list_key, 0, self.MAX_ITEMS_PER_TYPE - 1)

            # Set TTL for the list
            await self.redis_client.expire(list_key, timedelta(days=self.TTL_DAYS))

            logger.info(f"Stored {data_type} webhook data for item {item_id}")

        except Exception as e:
            logger.error(f"Failed to store webhook data for {data_type}:{item_id}: {e}")
            raise

    async def get_webhook_data(
        self, data_type: str, item_id: str
    ) -> dict[str, Any] | None:
        """
        Retrieve webhook data from Redis.

        Args:
            data_type: Type of webhook data (posts, comments, inboxes)
            item_id: Unique identifier for the item

        Returns:
            Cached data if found, None otherwise
        """
        try:
            await self._ensure_connection()

            item_key = self._get_cache_key(data_type, item_id)
            data = await self.redis_client.get(item_key)

            if data:
                return json.loads(data)
            return None

        except Exception as e:
            logger.error(
                f"Failed to retrieve webhook data for {data_type}:{item_id}: {e}"
            )
            return None

    async def get_recent_webhook_data(
        self, data_type: str, limit: int | None = None
    ) -> list[dict[str, Any]]:
        """
        Get recent webhook data for a specific type.

        Args:
            data_type: Type of webhook data (posts, comments, inboxes)
            limit: Maximum number of items to return (defaults to MAX_ITEMS_PER_TYPE)

        Returns:
            list of recent webhook data
        """
        try:
            await self._ensure_connection()

            if limit is None:
                limit = self.MAX_ITEMS_PER_TYPE

            list_key = self._get_list_key(data_type)
            item_ids = await self.redis_client.lrange(list_key, 0, limit - 1)

            result = []
            for item_id in item_ids:
                data = await self.get_webhook_data(data_type, item_id)
                if data:
                    result.append(data)

            return result

        except Exception as e:
            logger.error(f"Failed to retrieve recent webhook data for {data_type}: {e}")
            return []

    async def clear_webhook_data(self, data_type: str, item_id: str) -> bool:
        """
        Remove specific webhook data from cache.

        Args:
            data_type: Type of webhook data (posts, comments, inboxes)
            item_id: Unique identifier for the item

        Returns:
            True if item was removed, False otherwise
        """
        try:
            await self._ensure_connection()

            item_key = self._get_cache_key(data_type, item_id)
            list_key = self._get_list_key(data_type)

            # Remove from item storage
            await self.redis_client.delete(item_key)

            # Remove from list
            await self.redis_client.lrem(list_key, 0, item_id)

            logger.info(f"Cleared {data_type} webhook data for item {item_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to clear webhook data for {data_type}:{item_id}: {e}")
            return False

    async def clear_all_webhook_data(self, data_type: str) -> bool:
        """
        Clear all webhook data for a specific type.

        Args:
            data_type: Type of webhook data (posts, comments, inboxes)

        Returns:
            True if successful, False otherwise
        """
        try:
            await self._ensure_connection()

            list_key = self._get_list_key(data_type)
            item_ids = await self.redis_client.lrange(list_key, 0, -1)

            # Delete all items
            for item_id in item_ids:
                item_key = self._get_cache_key(data_type, item_id)
                await self.redis_client.delete(item_key)

            # Delete the list
            await self.redis_client.delete(list_key)

            logger.info(f"Cleared all {data_type} webhook data")
            return True

        except Exception as e:
            logger.error(f"Failed to clear all webhook data for {data_type}: {e}")
            return False


# Global Redis client instance
redis_client = RedisClient()
