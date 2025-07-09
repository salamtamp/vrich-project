from app.core.config import settings
from app.utils.database import Database
from app.utils.logging import log_message
from datetime import datetime
from typing import Dict, Any, Optional

import json
import uuid
import sys


class FacebookPostProcessor:
    def __init__(self):
        self.database = Database(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            database=settings.DATABASE_NAME,
        )

        self.database.connect()


    def process_facebook_post(self, message: Dict[str, Any]) -> bool:
        """Process and save a Facebook post from a message."""
        try:
            profile_id = self._get_profile_id(message["from_id"], message["from_name"])
            post_data = self._extract_post_data(profile_id, message)
            if not post_data:
                log_message("FacebookPostProcessor", "error", "Invalid message format")
                return False

            self._save_facebook_post(post_data)

            return True

        except Exception as e:
            log_message("FacebookPostProcessor", "error", f"Error processing Facebook post: {e}")
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
        result = self.database.execute_command(query, ("page", id, name))

        # Get the newly created profile ID
        query = """
            SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1
        """
        result = self.database.execute_query(query, (id,))

        return result[0]["id"]

    def _extract_post_data(self, profile_id: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'page_id', 'media_url', 'media_type', 'type']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookPostProcessor", "error", f"Missing required field: {field}")
                    return None

            published_at = datetime.strptime(message["created_time"], "%Y-%m-%dT%H:%M:%S%z")
            now = datetime.now()

            post_data = {
                'profile_id': profile_id,
                'post_id': message["id"],
                'message': message["message"],
                'type': message["type"],
                'link': f"https://www.facebook.com/posts/{message['id']}",
                'media_url': message["media_url"],
                'media_type': message["media_type"],
                'status': "inactive",
                'published_at': published_at.isoformat(),
                'created_at': now.isoformat(),
                'updated_at': now.isoformat(),
                'deleted_at': None
            }

            return post_data

        except (ValueError, KeyError) as e:
            log_message("FacebookPostProcessor", "error", f"Error extracting post data: {e}")
            return None

    def _save_facebook_post(self, post_data: Dict[str, Any]) -> None:
        query = """
            INSERT INTO facebook_posts (
                id, profile_id, post_id, message, type, link,
                media_url, media_type, status, published_at,
                created_at, updated_at, deleted_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (post_id) DO NOTHING
        """

        params = (
            str(uuid.uuid4()),
            post_data['profile_id'],
            post_data['post_id'],
            f"{post_data['message']}",
            post_data['type'],
            post_data['link'],
            post_data['media_url'],
            post_data['media_type'],
            post_data['status'],
            post_data['published_at'],
            post_data['created_at'],
            post_data['updated_at'],
            post_data['deleted_at'],
        )

        try:
            affected_rows = self.database.execute_command(query, params)
            if affected_rows > 0:
                log_message("FacebookPostProcessor", "debug", f"Facebook post saved successfully: {post_data['post_id']}")
            else:
                log_message("FacebookPostProcessor", "info", f"Post already exists, skipped: {post_data['post_id']}")

        except Exception as e:
            log_message("FacebookPostProcessor", "error", f"Database error saving post {post_data['post_id']}: {e}")
            raise