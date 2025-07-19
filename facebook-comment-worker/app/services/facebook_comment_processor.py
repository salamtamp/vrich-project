from app.core.config import settings
from app.utils.database import Database
from app.utils.logging import log_message
from datetime import datetime
from typing import Dict, Any, Optional

import httpx
import uuid


class FacebookCommentProcessor:
    def __init__(self):
        self.database = Database(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            database=settings.DATABASE_NAME,
        )

        self.database.connect()

    def _noti_facebook_comment(self, host: str, comment_id: str) -> bool:
        """Send notification about Facebook comment to webhook endpoint."""
        try:
            webhook_url = f"http://{host}/api/v1/webhooks/facebook-comments"
            payload = {
                "event": "seeded_event",
                "id": comment_id
            }

            with httpx.Client() as client:
                response = client.post(
                    webhook_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=30.0
                )

                if response.status_code == 200:
                    log_message("FacebookCommentProcessor", "debug", f"Webhook notification sent successfully for comment: {comment_id}")
                    return True
                else:
                    log_message("FacebookCommentProcessor", "error", f"Webhook notification failed with status {response.status_code}: {response.text}")
                    return False

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error sending webhook notification for comment {comment_id}: {e}")
            return False

    def process_facebook_comment(self, message: Dict[str, Any]) -> bool:
        """Process and save a Facebook comment from a message."""
        try:
            profile_id = self._get_profile_id(message["from_id"], message["from_name"])
            if not profile_id:
                log_message("FacebookCommentProcessor", "error", f"Profile not found: {message['from_id']}")
                return False

            post_id = self._get_post_id(message["post_id"])
            if not post_id:
                log_message("FacebookCommentProcessor", "error", f"Post not found: {message['post_id']}")
                return False

            comment_data = self._extract_comment_data(profile_id, post_id, message)
            if not comment_data:
                log_message("FacebookCommentProcessor", "error", "Invalid message format")
                return False

            self._save_facebook_comment(comment_data)

            return True

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error processing Facebook comment: {e}")
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

    def _get_post_id(self, id: str) -> str:
        query = """
            SELECT id FROM facebook_posts WHERE post_id = %s LIMIT 1
        """
        result = self.database.execute_query(query, (id,))

        if result:
            return result[0]["id"]

        return ""

    def _extract_comment_data(self, profile_id: str, post_id: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'post_id', 'type']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookCommentProcessor", "error", f"Missing required field: {field}")
                    return None

            published_at = datetime.strptime(message["created_time"], "%Y-%m-%dT%H:%M:%S%z")
            now = datetime.now()

            comment_data = {
                'profile_id': profile_id,
                'post_id': post_id,
                'comment_id': message["id"],
                'message': message["message"],
                'type': message["type"],
                'link': f"https://www.facebook.com/{message['id']}",
                'published_at': published_at.isoformat(),
                'created_at': now.isoformat(),
                'updated_at': now.isoformat(),
                'deleted_at': None
            }

            return comment_data

        except (ValueError, KeyError) as e:
            log_message("FacebookCommentProcessor", "error", f"Error extracting comment data: {e}")
            return None

    def _save_facebook_comment(self, comment_data: Dict[str, Any]) -> None:
        query = """
            INSERT INTO facebook_comments (
                id, profile_id, post_id, comment_id, message, type,
                link, published_at, created_at, updated_at, deleted_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (comment_id) DO NOTHING
        """

        params = (
            str(uuid.uuid4()),
            comment_data['profile_id'],
            comment_data['post_id'],
            comment_data['comment_id'],
            f"{comment_data['message']}",
            comment_data['type'],
            comment_data['link'],
            comment_data['published_at'],
            comment_data['created_at'],
            comment_data['updated_at'],
            comment_data['deleted_at'],
        )

        try:
            affected_rows = self.database.execute_command(query, params)
            if affected_rows > 0:
                log_message("FacebookCommentProcessor", "debug", f"Facebook comment saved successfully: {comment_data['post_id']}")
                self._noti_facebook_comment(f"{settings.WEBHOOK_HOST}:{settings.WEBHOOK_PORT}", comment_data['comment_id'])
            else:
                log_message("FacebookCommentProcessor", "info", f"Comment already exists, skipped: {comment_data['post_id']}")

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Database error saving comment {comment_data['post_id']}: {e}")
            raise