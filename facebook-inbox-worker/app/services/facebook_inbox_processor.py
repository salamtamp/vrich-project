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

    def process_facebook_inbox(self, message: Dict[str, Any]) -> Tuple[bool, Optional[Exception]]:
        """Process and save a Facebook inbox from a message."""
        try:
            print("[process_facebook_inbox] message:", message)
            profile_id, error = self._get_profile_id(message["from_id"], message["from_name"])
            if error:
                log_message("FacebookInboxProcessor", "error", f"Error getting profile ID: {error}")
                return False, error

            print("[process_facebook_inbox] profile_id:", profile_id)

            inbox_data, error = self._extract_inbox_data(profile_id, message)
            if error:
                log_message("FacebookInboxProcessor", "error", f"Error extracting inbox data: {error}")
                return False, error

            print("[process_facebook_inbox] inbox_data:", inbox_data)

            error = self._save_facebook_inbox(inbox_data)
            if error:
                log_message("FacebookInboxProcessor", "error", f"Error saving Facebook inbox: {error}")
                return False, error

            print("[process_facebook_inbox] saved inbox_data:", inbox_data)

            matching_product, error = self._get_matching_products(inbox_data["message"])
            if error:
                log_message("FacebookInboxProcessor", "error", f"Error getting matching product: {error}")
                return False, error

            print("[process_facebook_inbox] matching_product error:", error)

            if not matching_product:
                log_message("FacebookInboxProcessor", "info", f"No matching product found for inbox message: {inbox_data['message']}, skipped")
                return True, None

            print("[process_facebook_inbox] matching_product:", matching_product)

            _, error = self._create_order(
                profile_id,
                matching_product.campaign_id,
                matching_product.campaign_product_id,
                matching_product.quantity,
                matching_product.max_quantity,
            )

            print("[process_facebook_inbox] created order")

            if error:
                log_message("FacebookInboxProcessor", "error", f"Failed to create order: {error}")
                return False, error


            return True, None

        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Error processing Facebook inbox: {e}")
            return False, e


    def _get_profile_id(self, id: str, name: str) -> Tuple[Optional[str], Optional[Exception]]:
        try:
            query = """
                SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1
            """
            result = self.database.execute_query(query, (id,))

            if result:
                return result[0]["id"], None

            query = """
                INSERT INTO facebook_profiles (type, facebook_id, name) VALUES (%s, %s, %s) RETURNING id
            """
            result = self.database.execute_command(query, ("user", id, name))

            # Get the newly created profile ID
            query = """
                SELECT id FROM facebook_profiles WHERE facebook_id = %s LIMIT 1
            """
            result = self.database.execute_query(query, (id,))

            return result[0]["id"], None
        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Error getting profile ID for facebook_id={id}, name={name}: {e}")
            return None, e


    def _get_matching_products(self, message: str) -> Tuple[Optional[MatchingProduct], Optional[Exception]]:
        keyword = message.strip().lower()
        query = """
            WITH active_campaigns AS (
                SELECT id FROM campaigns WHERE status = %s
            )
            SELECT
                cp.keyword, cp.id, cp.product_id, cp.campaign_id, cp.max_order_quantity as max_quantity
            FROM campaigns_products cp
            JOIN active_campaigns ac ON cp.campaign_id = ac.id
            WHERE cp.keyword = %s AND cp.quantity > 0 AND cp.status = 'active'
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
                log_message("FacebookInboxProcessor", "error", f"Failed to create or fetch order for profile_id={profile_id}, campaign_id={campaign_id}")
                return None, error

            if not order_id:
                log_message("FacebookInboxProcessor", "error", f"Failed to create or fetch order for profile_id={profile_id}, campaign_id={campaign_id}")
                return None, error

            _, error = self._create_order_product(order_id, profile_id, campaign_product_id, quantity, max_quantity)
            if error:
                if "exceeds max allowed" in str(error):
                    log_message("FacebookInboxProcessor", "info", f"Order product quantity exceeds max allowed for order_id={order_id}")
                    return order_id, None

                log_message("FacebookInboxProcessor", "error", f"Failed to create order product for order_id={order_id}")
                return None, error

            _, error = self._deduct_campaign_product_quantity(campaign_product_id, quantity)
            if error:
                log_message("FacebookInboxProcessor", "error", f"Failed to deduct product quantity for campaign_product_id={campaign_product_id}")
                return None, error

            return order_id, None
        except Exception as e:
            log_message("FacebookInboxProcessor", "error", f"Error creating order: {e}")
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
            log_message("FacebookInboxProcessor", "error", f"Error creating/fetching pending order for profile_id={profile_id}, campaign_id={campaign_id}: {e}")
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
                log_message("FacebookInboxProcessor", "info", error_msg)
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
            log_message("FacebookInboxProcessor", "error", f"Error creating order product: {e}")
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
            log_message("FacebookInboxProcessor", "error", f"Error deducting campaign product quantity: {e}")
            return None, e


    def _extract_inbox_data(self, profile_id: str, message: Dict[str, Any]) -> Tuple[Optional[Dict[str, Any]], Optional[Exception]]:
        """Extract inbox data from a message."""
        try:
            required_fields = ['id', 'message', 'created_time', 'from_name', 'from_id', 'type']
            for field in required_fields:
                if field not in message:
                    log_message("FacebookInboxProcessor", "error", f"Missing required field: {field}")
                    return None, Exception(f"Missing required field: {field}")

            published_at = datetime.fromisoformat(message["created_time"])
            now = datetime.now()

            inbox_data = {
                'profile_id': profile_id,
                'messenger_id': message["id"],
                'message': message["message"] if "message" in message else "",
                'type': message["type"],
                'link': "https://m.me",
                'media_type': None,
                'media_url': None,
                'published_at': published_at.isoformat(),
                'created_at': now.isoformat(),
                'updated_at': now.isoformat(),
                'deleted_at': None
            }

            if inbox_data["type"] in ["image", "video"]:
                inbox_data["media_type"] = message["type"]
                inbox_data["media_url"] = message["media_url"]

            return inbox_data, None

        except (ValueError, KeyError) as e:
            log_message("FacebookInboxProcessor", "error", f"Error extracting inbox data: {e}")
            return None, e


    def _save_facebook_inbox(self, inbox_data: Dict[str, Any]) -> Optional[Exception]:
        """Save a Facebook inbox to the database."""
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
            return e
