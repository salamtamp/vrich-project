from app.utils.queue import Queue

import httpx
import json
import logging

logger = logging.getLogger(__name__)

async def fetch_and_queue_posts_service(page_id: str, settings) -> bool:
    """Service function to fetch Facebook posts and queue them for processing"""
    try:
        url = f"{settings.FACEBOOK_BASE_URL}/{page_id}/posts"
        params = {
            "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
            "fields": "id,created_time,message,from",
            "limit": 50
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                logger.error(f"Facebook API Error: {data['error'].get('message', 'Unknown error')}")
                return False

            queue = Queue(
                host=settings.QUEUE_HOST,
                username=settings.QUEUE_USER,
                password=settings.QUEUE_PASS
            )
            queue.connect()

            posts_queued = 0
            for post in data.get("data", []):
                processed_data = {
                    "id": post.get("id"),
                    "message": post.get("message"),
                    "created_time": post.get("created_time"),
                    "from_name": post.get("from", {}).get("name", "UNKNOWN") if post.get("from") else "UNKNOWN",
                    "from_id": post.get("from", {}).get("id", "0000000000000999") if post.get("from") else "0000000000000999",
                    "page_id": page_id,
                    "media_url": None,
                    "media_type": None,
                    "type": "text"
                }

                queue.publish("facebook_posts", processed_data)
                posts_queued += 1

            logger.info(f"Successfully queued {posts_queued} posts for page {page_id}")
            return True

    except Exception as e:
        logger.error(f"Error fetching and queuing posts for page {page_id}: {str(e)}")
        return False

async def fetch_and_queue_comments_service(post_id: str, settings) -> bool:
    """Service function to fetch Facebook comments and queue them for processing"""
    try:
        url = f"{settings.FACEBOOK_BASE_URL}/{post_id}/comments"
        params = {
            "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
            "fields": "id,from,message,created_time",
            "order": "reverse_chronological",
            "limit": 10
        }

        print("[comment] url", url)
        print("[comment] params", params)

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                logger.error(f"Facebook API Error for post {post_id}: {data['error'].get('message', 'Unknown error')}")
                return False

            queue = Queue(
                host=settings.QUEUE_HOST,
                username=settings.QUEUE_USER,
                password=settings.QUEUE_PASS
            )
            queue.connect()

            comments = []
            for comment in data.get("data", []):
                comment_data = {
                    "id": comment.get("id"),
                    "message": comment.get("message", ""),
                    "created_time": comment.get("created_time"),
                    "from_name": comment.get("from", {}).get("name", "UNKNOWN") if comment.get("from") else "UNKNOWN",
                    "from_id": comment.get("from", {}).get("id") if comment.get("from") else "0000000000000999",
                    "post_id": post_id,
                    "type": "text"
                }

                comments.append(comment_data)

            print("[comment] comments", json.dumps(comments, indent=4))

            if comments:
                for comment in comments:
                    queue.publish("facebook_comments", comment)

                logger.info(f"Successfully fetched and queued {len(comments)} comments for post {post_id}")
                return True
            else:
                logger.info(f"No comments found for post {post_id}")
                return True

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching comments for post {post_id}: {e.response.text}")
        return False
    except httpx.RequestError as e:
        logger.error(f"Request error fetching comments for post {post_id}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error fetching comments for post {post_id}: {str(e)}")
        return False