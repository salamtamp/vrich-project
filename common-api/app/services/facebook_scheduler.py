import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("app.services.facebook_scheduler")
logger.setLevel(logging.INFO)

SCHEDULER_BASE_URL = settings.FACEBOOK_SCHEDULER_BASE_URL

DEFAULT_SCHEDULE = 10
DEFAULT_TRIGGER_TYPE = "interval"


def start_comments_scheduler(
    post_ids: list[str],
    schedule: int = DEFAULT_SCHEDULE,
    trigger_type: str = DEFAULT_TRIGGER_TYPE,
) -> bool:
    url = f"{SCHEDULER_BASE_URL}/api/v1/facebooks/scheduler/comments/start"
    logger.info(
        "[DEBUG] start_comments_scheduler called with "
        f"post_ids={post_ids}, schedule={schedule}, "
        f"trigger_type={trigger_type}"
    )

    try:
        with httpx.Client(timeout=5) as client:
            resp = client.post(
                url,
                json={
                    "postIds": post_ids,
                    "schedule": schedule,
                    "triggerType": trigger_type,
                },
            )
            logger.info(
                f"[DEBUG] Scheduler response: status={resp.status_code}, "
                f"body={resp.text}"
            )
            if resp.status_code >= 400:
                logger.warning(
                    "Failed to start scheduler for posts: %s, status: %s, detail: %s",
                    post_ids,
                    resp.status_code,
                    resp.text,
                )
                return False
            return True
    except Exception as e:
        logger.error(f"Error calling scheduler start for posts {post_ids}: {e}")
        return False


def stop_comments_scheduler(post_ids: list[str]) -> bool:
    url = f"{SCHEDULER_BASE_URL}/api/v1/facebooks/scheduler/comments/stop"
    logger.info(f"[DEBUG] stop_comments_scheduler called with postIds={post_ids}")
    try:
        with httpx.Client(timeout=5) as client:
            resp = client.post(
                url,
                json={"postIds": post_ids},
            )
            logger.info(
                f"[DEBUG] Scheduler response: status={resp.status_code}, "
                f"body={resp.text}"
            )
            if resp.status_code >= 400:
                logger.warning(
                    "Failed to stop scheduler for posts: %s, status: %s, detail: %s",
                    post_ids,
                    resp.status_code,
                    resp.text,
                )
                return False
            return True
    except Exception as e:
        logger.error(f"Error calling scheduler stop for posts {post_ids}: {e}")
        return False
