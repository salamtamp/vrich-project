from app.core.config import settings
from app.utils.database import Database
from app.utils.logging import log_message
from datetime import datetime
from typing import Dict, Any, Optional

import httpx
import uuid


class FacebookInboxProcessor:
    def __init__(self):
        self.database = Database(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            database=settings.DATABASE_NAME,
        )

        self.database.connect()

    def _noti_facebook_inbox(self, host: str, inbox_id: str) -> bool:
        """Send notification about Facebook inbox to webhook endpoint."""
        try:
            webhook_url = f"http://{host}/api/v1/webhooks/facebook-inboxes"
            payload = {
                "event": "seeded_event",
                "id": inbox_id
            }

            with httpx.Client() as client:
                response = client.post(
                    webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )

                if response.status_code == 200:
                    log_message("FacebookInboxProcessor", "debug", f"Webhook notification sent successfully for inbox: {inbox_id}")
                    return True
                else:
                    log_message("FacebookInboxProcessor", "error", f"Webhook notification failed with status {response.status_code}: {response.text}")
                    return False

        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Error sending webhook notification for inbox {inbox_id}: {e}")
            return False

    def process_facebook_inbox(self, message: Dict[str, Any]) -> bool:
        """Process and save a Facebook inbox from a message."""
        try:
            profile_id = self._get_profile_id(message["from_id"], message["from_name"])
            if not profile_id:
                log_message("FacebookInboxProcessor", "error", f"Profile not found: {message['from_id']}")
                return False

            inbox_data = self._extract_inbox_data(profile_id, message)
            if not inbox_data:
                log_message("FacebookInboxProcessor", "error", "Invalid message format")
                return False

            self._save_facebook_inbox(inbox_data)

            return True

        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Error processing Facebook inbox: {e}")
            return False

    def _get_profile_id(self, id: str, name: str) -> str:
        query = """
            SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1
        """
        result = self.database.execute_query(query, (id,))

        if result:
            return result[0]["id"]

        query = """
            INSERT INTO facebook_profiles (type, facebook_id, name) VALUES (%s, %s, %s) RETURNING id
        """
        result = self.database.execute_command(query, ("user", id, name))

        # Get the newly created profile ID
        query = """
            SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1
        """
        result = self.database.execute_query(query, (id,))

        return result[0]["id"]

    def _extract_inbox_data(self, profile_id: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'type']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookInboxProcessor", "error", f"Missing required field: {field}")
                    return None

            timestamp_ms = int(message["created_time"])
            published_at = datetime.fromtimestamp(timestamp_ms / 1000.0)
            now = datetime.now()

            inbox_data = {
                'profile_id': profile_id,
                'messenger_id': message["id"],
                'message': message["message"] if "message" in message else "",
                'type': message["type"],
                'link': "https://m.me",
                'published_at': published_at.isoformat(),
                'media_type': None,
                'media_url': None,
                'created_at': now.isoformat(),
                'updated_at': now.isoformat(),
                'deleted_at': None
            }

            if inbox_data["type"] in ["image", "video"]:
                inbox_data["media_type"] = message["type"]
                inbox_data["media_url"] = message["media_url"]

            return inbox_data

        except (ValueError, KeyError) as e:
            log_message("FacebookInboxProcessor", "error", f"Error extracting inbox data: {e}")
            return None

    def _save_facebook_inbox(self, inbox_data: Dict[str, Any]) -> None:

        query = """
            INSERT INTO facebook_inboxes (
                id, profile_id, messenger_id, message, type, link,
                published_at, media_type, media_url, created_at, updated_at, deleted_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (messenger_id) DO NOTHING
        """

        params = (
            str(uuid.uuid4()),
            inbox_data['profile_id'],
            inbox_data['messenger_id'],
            f"{inbox_data['message']}",
            inbox_data['type'],
            inbox_data['link'],
            inbox_data['published_at'],
            inbox_data['media_type'],
            inbox_data['media_url'],
            inbox_data['created_at'],
            inbox_data['updated_at'],
            inbox_data['deleted_at'],
        )

        try:
            affected_rows = self.database.execute_command(query, params)
            if affected_rows > 0:
                log_message("FacebookInboxProcessor", "debug", f"Facebook inbox saved successfully: {inbox_data['messenger_id']}")
                self._noti_facebook_inbox(f"{settings.WEBHOOK_HOST}:{settings.WEBHOOK_PORT}", inbox_data['messenger_id'])
            else:
                log_message("FacebookInboxProcessor", "info", f"Inbox already exists, skipped: {inbox_data['messenger_id']}")

        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Database error saving inbox {inbox_data['messenger_id']}: {e}")
            raise