import uuid
from typing import Any

from app.utils.redis import redis_client


class WebhookCacheService:
    def __init__(self):
        self.client = redis_client
        self.max_items = 10

    def _generate_unique_id(self, item_id: str) -> str:
        """
        Generate a unique ID by appending a UUID with hyphens to item_id.
        Ensures uniqueness for webhook entries with the same item_id.
        """
        unique_uuid = str(uuid.uuid4())
        return f"{item_id}_{unique_uuid}"

    async def save_webhook(self, data_type: str, item_id: str, data: dict[str, Any]):
        """
        Save webhook data to Redis, ensuring no more than max_items are stored.
        If there are already max_items, remove the oldest before adding the new one.
        """
        try:
            # Generate unique ID by adding timestamp
            unique_item_id = self._generate_unique_id(item_id)

            await self.client._ensure_connection()
            list_key = self.client._get_list_key(data_type)
            current_len = await self.client.redis_client.llen(list_key)
            if current_len >= self.max_items:
                oldest_id = await self.client.redis_client.rpop(list_key)
                if oldest_id:
                    await self.client.redis_client.delete(
                        self.client._get_cache_key(data_type, oldest_id)
                    )
            await self.client.store_webhook_data(data_type, unique_item_id, data)
        except Exception as e:
            # Removed print statement for failed webhook cache
            pass
            # Continue without caching


webhook_cache_service = WebhookCacheService()
