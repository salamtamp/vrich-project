from app.core.config import settings
from app.utils.database import Database
from app.utils.logging import log_message
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

import uuid
import httpx

@dataclass
class MatchingProduct:
    keyword: str
    campaign_product_id: str
    product_id: str
    campaign_id: str
    quantity: int = 1
    max_quantity: int = 100


# Constants
ACTIVE_STATUS = "active"
PENDING_STATUS = "pending"
DEFAULT_MAX_QUANTITY = 100

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

    def close(self):
        self.database.close()

    def _noti_facebook_comment(self, host: str, comment_id: str) -> Tuple[bool, Optional[Exception]]:
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
                    return True, None
                else:
                    log_message("FacebookCommentProcessor", "error", f"Webhook notification failed with status {response.status_code}: {response.text}")
                    return False, None

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error sending webhook notification for comment {comment_id}: {e}")
            return False, e


    def process_facebook_comment(self, message: Dict[str, Any]) -> Optional[Exception]:
        """Process and save a Facebook comment from a message."""
        try:
            profile_id, error = self._get_profile_id(message["from_id"], message["from_name"])
            if error or not profile_id:
                log_message("FacebookCommentProcessor", "error", f"Profile not found: {message['from_id']}")
                raise error or Exception("Profile not found")

            post_id, error = self._get_post_id(message["post_id"])
            if error or not post_id:
                log_message("FacebookCommentProcessor", "error", f"Post not found: {message['post_id']}")
                raise error or Exception("Post not found")

            comment_data, error = self._extract_comment_data(profile_id, post_id, message)
            if error:
                log_message("FacebookCommentProcessor", "error", f"Error extracting comment data: {error}")
                raise error

            error = self._save_facebook_comment(comment_data)
            if error:
                log_message("FacebookCommentProcessor", "error", f"Error saving Facebook comment: {error}")
                raise Exception("Error saving Facebook comment")

            matching_product, error = self._get_matching_products(comment_data["message"])
            if error:
                log_message("FacebookCommentProcessor", "error", f"Error getting matching product: {error}")
                raise error

            if not matching_product:
                log_message("FacebookCommentProcessor", "info", f"No matching product found for comment message: {comment_data['message']}, skipped")
                return None

            _, error = self._create_order(
                profile_id,
                matching_product.campaign_id,
                matching_product.campaign_product_id,
                matching_product.quantity,
                matching_product.max_quantity,
            )

            if error:
                log_message("FacebookCommentProcessor", "error", f"Failed to create order: {error}")
                return error

            return None

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error processing Facebook comment: {e}")
            return e


    def _get_profile_id(self, id: str, name: str) -> Tuple[Optional[str], Optional[Exception]]:
        try:
            query = "SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1"
            result = self.database.execute_query(query, (id,))
            if result:
                return result[0]["id"], None

            # Insert and return the new id directly
            query = "INSERT INTO facebook_profiles (type, facebook_id, name) VALUES (%s, %s, %s) RETURNING id"
            result = self.database.execute_command(query, ("user", id, name))
            if result and isinstance(result, list) and result[0].get("id"):
                return result[0]["id"], None
            else:
                return None, Exception("Failed to insert new profile")
        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error getting profile ID for facebook_id={id}, name={name}: {e}")
            return None, e


    def _get_post_id(self, id: str) -> Tuple[Optional[str], Optional[Exception]]:
        query = "SELECT id FROM facebook_posts WHERE post_id = %s LIMIT 1"
        result = self.database.execute_query(query, (id,))
        if result:
            return result[0]["id"], None
        return None, None


    def _get_matching_products(self, message: str) -> Tuple[Optional[MatchingProduct], Optional[Exception]]:
        keyword = message.strip().lower()
        query = f"""
            WITH active_campaigns AS (
                SELECT id FROM campaigns WHERE status = %s
            )
            SELECT
                cp.keyword, cp.id, cp.product_id, cp.campaign_id, cp.max_order_quantity as max_quantity
            FROM campaigns_products cp
            JOIN active_campaigns ac ON cp.campaign_id = ac.id
            WHERE cp.keyword = %s AND cp.quantity > 0
            LIMIT 1;
        """
        found = self.database.execute_query(query, (ACTIVE_STATUS, keyword))
        if found:
            return MatchingProduct(
                keyword=found[0]["keyword"],
                campaign_product_id=found[0]["id"],
                product_id=found[0]["product_id"],
                campaign_id=found[0]["campaign_id"],
                quantity=1,
                max_quantity=found[0]["max_quantity"] or DEFAULT_MAX_QUANTITY
            ), None
        return None, None


    def _create_order(self, profile_id: str, campaign_id: str, campaign_product_id: str, quantity: int, max_quantity: int) -> Tuple[Optional[str], Optional[Exception]]:
        try:
            order_id, error = self._create_pending_order(profile_id, campaign_id)
            if error:
                log_message("FacebookCommentProcessor", "error", f"Failed to create or fetch order for profile_id={profile_id}, campaign_id={campaign_id}")
                return None, error

            if not order_id:
                log_message("FacebookCommentProcessor", "error", f"Failed to create or fetch order for profile_id={profile_id}, campaign_id={campaign_id}")
                return None, error

            _, error = self._create_order_product(order_id, profile_id, campaign_product_id, quantity, max_quantity)
            if error:
                if "exceeds max allowed" in str(error):
                    log_message("FacebookCommentProcessor", "info", f"Order product quantity exceeds max allowed for order_id={order_id}")
                    return order_id, None

                log_message("FacebookCommentProcessor", "error", f"Failed to create order product for order_id={order_id}")
                return None, error

            _, error = self._deduct_campaign_product_quantity(campaign_product_id, quantity)
            if error:
                log_message("FacebookCommentProcessor", "error", f"Failed to deduct product quantity for campaign_product_id={campaign_product_id}")
                return None, error

            return order_id, None
        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error creating order: {e}")
            return None, e


    def _create_pending_order(self, profile_id: str, campaign_id: str) -> Tuple[Optional[str], Optional[Exception]]:
        query = """
            WITH ins AS (
                INSERT INTO orders (profile_id, campaign_id, status)
                VALUES (%s, %s, %s)
                ON CONFLICT (profile_id, campaign_id) DO NOTHING
                RETURNING id
            )
            SELECT id FROM ins
            UNION ALL
            SELECT id FROM orders WHERE profile_id = %s AND campaign_id = %s LIMIT 1
        """
        try:
            result = self.database.execute_query(
                query, (profile_id, campaign_id, PENDING_STATUS, profile_id, campaign_id)
            )
            order_id = result[0]["id"] if result else None
            return order_id, None
        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error creating/fetching pending order for profile_id={profile_id}, campaign_id={campaign_id}: {e}")
            return None, e


    def _create_order_product(self, order_id: str, profile_id: str, campaign_product_id: str, quantity: int, max_quantity: int) -> Tuple[Optional[str], Optional[Exception]]:
        select_query = """
            SELECT quantity FROM orders_products
            WHERE order_id = %s AND profile_id = %s AND campaign_product_id = %s
        """
        try:
            result = self.database.execute_query(select_query, (order_id, profile_id, campaign_product_id))
            current_quantity = result[0]["quantity"] if result else 0

            if current_quantity + quantity > max_quantity:
                error_msg = f"Order product quantity ({current_quantity} + {quantity}) exceeds max allowed ({max_quantity})"
                log_message("FacebookCommentProcessor", "info", error_msg)
                return None, Exception(error_msg)

            query = """
                INSERT INTO orders_products (order_id, profile_id, campaign_product_id, quantity)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (order_id, profile_id, campaign_product_id)
                DO UPDATE
                SET quantity = orders_products.quantity + %s
                RETURNING id;
            """
            order_product_id = self.database.execute_command(query, (order_id, profile_id, campaign_product_id, quantity, quantity))
            return order_product_id, None
        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error creating order product: {e}")
            return None, e


    def _deduct_campaign_product_quantity(self, campaign_product_id: str, quantity: int) -> Tuple[Optional[str], Optional[Exception]]:
        query = """
            UPDATE campaigns_products
            SET quantity = quantity - %s
            WHERE id = %s
        """
        try:
            self.database.execute_command(query, (quantity, campaign_product_id))
            return campaign_product_id, None
        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Error deducting campaign product quantity: {e}")
            return None, e


    def _extract_comment_data(self, profile_id: str, post_id: str, message: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[Exception]]:
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'post_id', 'type']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookCommentProcessor", "error", f"Missing required field: {field}")
                    return None, Exception("Missing required field")

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

            return comment_data, None

        except (ValueError, KeyError) as e:
            log_message("FacebookCommentProcessor", "error", f"Error extracting comment data: {e}")
            return None, e


    def _save_facebook_comment(self, comment_data: Dict[str, Any]) -> Optional[Exception]:
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

            return None

        except Exception as e:
            log_message("FacebookCommentProcessor", "error", f"Database error saving comment {comment_data['post_id']}: {e}")
            return e
