from app.core.config import database
from app.utils.logging import log_message
from datetime import datetime
from typing import Dict, Any, Optional

import json
import uuid


class FacebookCommentProcessor:
    def __init__(self):
        pass

    def process_facebook_comment(self, message: Dict[str, Any]) -> bool:
        """Process and save a Facebook comment from a message."""
        try:
            profile_id = self._get_profile_id(message["from_id"], message["from_name"])
            comment_data = self._extract_comment_data(profile_id, message)
            if not comment_data:
                log_message("FacebookCommentProcessor", "error", "Invalid message format")
                return False

            # Save to database
            self._save_facebook_comment(comment_data)

            return True

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error processing Facebook comment: {e}")
            return False

    def _get_profile_id(self, id: str, name: str) -> str:
        """Get or create a Facebook profile ID."""
        query = """
            SELECT id FROM facebook_profiles WHERE facebook_id = %s
        """
        result = database.execute_command(query, (id))

        if len(result) == 0:
            query = """
                INSERT INTO facebook_profiles (type, facebook_id, name) VALUES (%s, %s, %s) RETURNING id
            """
            result = database.execute_command(query, ("user", id, name))
            return result[0]["id"]

        return result[0]["id"]

    def _extract_comment_data(self, profile_id: str, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extract comment data from the message."""
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'post_id', 'parent_id']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookCommentProcessor", "error", f"Missing required field: {field}")
                    return None

            published_at = datetime.strptime(message["created_time"], "%Y-%m-%dT%H:%M:%S%z")
            now = datetime.now()

            comment_data = {
                'profile_id': profile_id,
                'comment_id': message["id"],
                'post_id': message["post_id"],
                'parent_id': message.get("parent_id"),  # For replies to comments
                'message': message["message"],
                'link': f"https://www.facebook.com/permalink.php?story_fbid={message['post_id']}&comment_id={message['id']}",
                'status': "active",
                'published_at': published_at,
                'created_at': now,
                'updated_at': now,
                'deleted_at': None
            }

            return comment_data

        except (ValueError, KeyError) as e:
            log_message("FacebookCommentProcessor", "error", f"Error extracting comment data: {e}")
            return None

    def _save_facebook_comment(self, comment_data: Dict[str, Any]) -> None:
        """Save the Facebook comment to the database."""
        query = """
            INSERT INTO facebook_comments (
                id, profile_id, comment_id, post_id, parent_id, message, link,
                status, published_at, created_at, updated_at, deleted_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            ON CONFLICT (comment_id) DO NOTHING
        """

        params = (
            uuid.uuid4(),
            comment_data['profile_id'],
            comment_data['comment_id'],
            comment_data['post_id'],
            comment_data['parent_id'],
            comment_data['message'],
            comment_data['link'],
            comment_data['status'],
            comment_data['published_at'],
            comment_data['created_at'],
            comment_data['updated_at'],
            comment_data['deleted_at']
        )

        print("data:", json.dumps(comment_data, indent=4))

        try:
            affected_rows = database.execute_command(query, params)
            if affected_rows > 0:
                log_message("FacebookCommentProcessor", "debug", f"Facebook comment saved successfully: {comment_data['comment_id']}")
            else:
                log_message("FacebookCommentProcessor", "info", f"Comment already exists, skipped: {comment_data['comment_id']}")

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Database error saving comment {comment_data['comment_id']}: {e}")
            raise