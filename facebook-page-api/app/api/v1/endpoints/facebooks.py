from app.core.config import get_settings, get_queue
from app.schedule.facebook_comments import facebook_comments_scheduler
from app.schedule.facebook_posts import facebook_posts_scheduler
from app.utils.queue import Queue
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

import httpx
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class FacebookPageProfileResponse(BaseModel):
    id: str
    name: str
    picture: Optional[str] = None

class FacebookPostResponse(BaseModel):
    id: str
    created_time: str
    message: Optional[str] = None
    from_user: str

class FacebookPostsResponse(BaseModel):
    data: List[FacebookPostResponse]
    paging: Optional[str] = None

class FacebookCommentResponse(BaseModel):
    id: str
    created_time: str
    message: Optional[str] = None
    from_user: str

class FacebookCommentsResponse(BaseModel):
    data: List[FacebookCommentResponse]
    paging: Optional[str] = None

class PostsSchedulerRequest(BaseModel):
    page_id: str = Field(alias="pageId")
    cron_schedule: str = Field(default="0 * * * *", alias="cronSchedule")

    class Config:
        populate_by_name = True

class CommentsSchedulerRequest(BaseModel):
    post_ids: List[str] = Field(alias="postIds")
    cron_schedule: str = Field(default="*/5 * * * *", alias="cronSchedule")  # Default: every 5 minutes

    class Config:
        populate_by_name = True

class SchedulerResponse(BaseModel):
    status: str
    message: str
    jobs_info: Optional[Dict[str, Any]] = None


@router.get("/profile", response_model=FacebookPageProfileResponse)
async def get_facebook_page_profile(
    page_id: str = Query(..., description="Facebook Page ID"),
    settings = Depends(get_settings),
):
    url = f"{settings.FACEBOOK_BASE_URL}/{page_id}"
    params = {
        "fields": "id,name,picture",
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Facebook API Error: {data['error'].get('message', 'Unknown error')}"
                )

            picture_url = data.get("picture", {}).get("data", {}).get("url") if data.get("picture") else None

            return FacebookPageProfileResponse(
                id=data.get("id"),
                name=data.get("name"),
                picture=picture_url
            )

    except HTTPException:
        # Re-raise HTTPException (including Facebook API errors) without modification
        raise
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error occurred: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Request error occurred: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@router.get("/posts", response_model=FacebookPostsResponse)
async def get_facebook_page_posts(
    page_id: str = Query(..., description="Facebook Page ID"),
    since: Optional[str] = Query(default=None, description="Start date filter (YYYY-MM-DD)"),
    until: Optional[str] = Query(default=None, description="End date filter (YYYY-MM-DD)"),
    limit: int = Query(default=20, description="Number of posts to retrieve"),
    next_token: Optional[str] = Query(default=None, description="Pagination token for next page"),
    settings = Depends(get_settings),
):
    url = f"{settings.FACEBOOK_BASE_URL}/{page_id}/posts"
    params = {
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
        "fields": "id,created_time,message,from",
        "limit": limit
    }

    if since:
        params["since"] = since
    if until:
        params["until"] = until
    if next_token:
        params["after"] = next_token

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Facebook API Error: {data['error'].get('message', 'Unknown error')}"
                )

            posts = []
            for post in data.get("data", []):
                posts.append(FacebookPostResponse(
                    id=post.get("id"),
                    created_time=post.get("created_time"),
                    message=post.get("message"),
                    from_user=post.get("from", {}).get("name", "") if post.get("from") else ""
                ))

            return FacebookPostsResponse(
                data=posts,
                paging=data.get("paging", {}).get("next")
            )

    except HTTPException:
        # Re-raise HTTPException (including Facebook API errors) without modification
        raise
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error occurred: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Request error occurred: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@router.get("/comments", response_model=FacebookCommentsResponse)
async def get_facebook_post_comments(
    post_id: str = Query(..., description="Facebook Post ID"),
    next_token: Optional[str] = Query(default=None, description="Pagination token for next page"),
    settings = Depends(get_settings),
):
    url = f"{settings.FACEBOOK_BASE_URL}/{post_id}/comments"
    params = {
        "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
        "fields": "id,from,message,created_time",
        "order": "reverse_chronological",
        "limit": 50,
        "summary": "true"
    }

    if next_token:
        params["after"] = next_token

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Facebook API Error: {data['error'].get('message', 'Unknown error')}"
                )

            comments = []
            for comment in data.get("data", []):
                comment_data = {
                    "id": comment.get("id"),
                    "message": comment.get("message", ""),
                    "created_time": comment.get("created_time"),
                    "from_name": comment.get("from", {}).get("name", "UNKNOWN") if comment.get("from") else "UNKNOWN",
                    "from_id": comment.get("from", {}).get("id") if comment.get("from") else "0000000000000000",
                    "post_id": post_id,
                    "type": "text"
                }

                comments.append(comment_data)

            return FacebookCommentsResponse(
                data=comments,
                paging=data.get("paging", {}).get("next")
            )

    except HTTPException:
        # Re-raise HTTPException (including Facebook API errors) without modification
        raise
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"HTTP error occurred: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Request error occurred: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


async def fetch_and_queue_posts_service(page_id: str, settings) -> bool:
    try:
        queue = get_queue()
        if not queue:
            queue = Queue(
                host=settings.QUEUE_HOST,
                username=settings.QUEUE_USER,
                password=settings.QUEUE_PASS
            )
            queue.connect()

        url = f"{settings.FACEBOOK_BASE_URL}/{page_id}/posts"
        params = {
            "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
            "fields": "id,message,created_time,from,status_type,attachments",
            "limit": 50
        }

        print("[post] url", url)
        print("[post] params", params)

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            if "error" in data:
                logger.error(f"Facebook API Error for page {page_id}: {data['error'].get('message', 'Unknown error')}")
                return False

            posts = []
            for post in data.get("data", []):
                post_data = {
                    "id": post.get("id"),
                    "message": post.get("message", ""),
                    "created_time": post.get("created_time"),
                    "from_name": post.get("from", {}).get("name", "UNKNOWN") if post.get("from") else "UNKNOWN",
                    "from_id": post.get("from", {}).get("id") if post.get("from") else "0000000000000000",
                    "page_id": page_id,
                }

                if post.get("status_type") == "added_photos":
                    attachments = post.get("attachments", {}).get("data", [])
                    post_data["media_url"] =attachments[0]["media"]["image"]["src"]
                    post_data["media_type"] = "photo"
                    post_data["type"] = "photo"
                elif post.get("status_type") == "added_video":
                    attachments = post.get("attachments", {}).get("data", [])
                    post_data["media_url"] =attachments[0]["media"]["source"]
                    post_data["media_type"] = "video"
                    post_data["type"] = "video"
                else:
                    post_data["media_url"] = None
                    post_data["media_type"] = None
                    post_data["type"] = "text"

                posts.append(post_data)

            if posts:
                for post in posts:
                    queue.publish("facebook_posts", post)

                logger.info(f"Successfully fetched and queued {len(posts)} posts for page {page_id}")
                return True
            else:
                logger.info(f"No posts found for page {page_id}")
                return True

    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error fetching posts for page {page_id}: {e.response.text}")
        return False
    except httpx.RequestError as e:
        logger.error(f"Request error fetching posts for page {page_id}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error fetching posts for page {page_id}: {str(e)}")
        return False

@router.post("/scheduler/posts/start", response_model=SchedulerResponse)
async def start_facebook_posts_scheduler(
    request: PostsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Start the Facebook posts scheduler with configurable cron schedule"""
    try:
        if facebook_posts_scheduler.is_running():
            return SchedulerResponse(
                status="error",
                message="Posts scheduler is already running"
            )

        facebook_posts_scheduler.start_scheduler(
            page_id=request.page_id,
            cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Posts scheduler started successfully for page {request.page_id}",
            jobs_info=facebook_posts_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error starting posts scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start posts scheduler: {str(e)}"
        )

@router.post("/scheduler/posts/stop", response_model=SchedulerResponse)
async def stop_facebook_posts_scheduler():
    """Stop the Facebook posts scheduler"""
    try:
        if not facebook_posts_scheduler.is_running():
            return SchedulerResponse(
                status="error",
                message="Posts scheduler is not running"
            )

        facebook_posts_scheduler.stop_scheduler()

        return SchedulerResponse(
            status="success",
            message="Posts scheduler stopped successfully",
            jobs_info=facebook_posts_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error stopping posts scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to stop posts scheduler: {str(e)}"
        )

@router.post("/scheduler/posts/restart", response_model=SchedulerResponse)
async def restart_facebook_posts_scheduler(
    request: PostsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Restart the Facebook posts scheduler with new parameters"""
    try:
        facebook_posts_scheduler.restart_scheduler(
            page_id=request.page_id,
            cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Posts scheduler restarted successfully for page {request.page_id}",
            jobs_info=facebook_posts_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error restarting posts scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restart posts scheduler: {str(e)}"
        )

@router.get("/scheduler/posts/status", response_model=SchedulerResponse)
async def get_posts_scheduler_status():
    """Get the current status of the Facebook posts scheduler"""
    try:
        return SchedulerResponse(
            status="success",
            message="Posts scheduler status retrieved successfully",
            jobs_info=facebook_posts_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error getting posts scheduler status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get posts scheduler status: {str(e)}"
        )

@router.post("/scheduler/posts/update", response_model=SchedulerResponse)
async def update_posts_scheduler_schedule(
    request: PostsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Update the cron schedule for the running posts scheduler"""
    try:
        if not facebook_posts_scheduler.is_running():
            raise HTTPException(
                status_code=400,
                detail="Posts scheduler is not running. Start it first."
            )

        facebook_posts_scheduler.update_schedule(
            page_id=request.page_id,
            new_cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Posts schedule updated successfully for page {request.page_id}",
            jobs_info=facebook_posts_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error updating posts scheduler schedule: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update posts scheduler schedule: {str(e)}"
        )

async def fetch_and_queue_comments_service(post_id: str, settings) -> bool:
    try:
        queue = get_queue()
        if not queue:
            queue = Queue(
                host=settings.QUEUE_HOST,
                username=settings.QUEUE_USER,
                password=settings.QUEUE_PASS
            )
            queue.connect()

        url = f"{settings.FACEBOOK_BASE_URL}/{post_id}/comments"
        params = {
            "access_token": settings.FACEBOOK_PAGE_ACCESS_TOKEN,
            "fields": "id,from,message,created_time",
            "order": "reverse_chronological",
            "limit": 50,
            "summary": "true"
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

@router.post("/scheduler/comments/start", response_model=SchedulerResponse)
async def start_facebook_comments_scheduler(
    request: CommentsSchedulerRequest,
    settings = Depends(get_settings),
):
    try:
        if facebook_comments_scheduler.is_running():
            return SchedulerResponse(
                status="error",
                message="Comments scheduler is already running"
            )

        facebook_comments_scheduler.start_scheduler(
            post_ids=request.post_ids,
            cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Comments scheduler started successfully for {len(request.post_ids)} posts",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error starting comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start comments scheduler: {str(e)}"
        )

@router.post("/scheduler/comments/stop", response_model=SchedulerResponse)
async def stop_facebook_comments_scheduler():
    """Stop the Facebook comments scheduler"""
    try:
        if not facebook_comments_scheduler.is_running():
            return SchedulerResponse(
                status="error",
                message="Comments scheduler is not running"
            )

        facebook_comments_scheduler.stop_scheduler()

        return SchedulerResponse(
            status="success",
            message="Comments scheduler stopped successfully",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error stopping comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to stop comments scheduler: {str(e)}"
        )

@router.post("/scheduler/comments/restart", response_model=SchedulerResponse)
async def restart_facebook_comments_scheduler(
    request: CommentsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Restart the Facebook comments scheduler with new parameters"""
    try:
        facebook_comments_scheduler.restart_scheduler(
            post_ids=request.post_ids,
            cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Comments scheduler restarted successfully for {len(request.post_ids)} posts",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error restarting comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restart comments scheduler: {str(e)}"
        )

@router.get("/scheduler/comments/status", response_model=SchedulerResponse)
async def get_comments_scheduler_status():
    """Get the current status of the Facebook comments scheduler"""
    try:
        return SchedulerResponse(
            status="success",
            message="Comments scheduler status retrieved successfully",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error getting comments scheduler status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get comments scheduler status: {str(e)}"
        )

@router.post("/scheduler/comments/update", response_model=SchedulerResponse)
async def update_comments_scheduler_schedule(
    request: CommentsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Update the cron schedule for the running comments scheduler"""
    try:
        if not facebook_comments_scheduler.is_running():
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        facebook_comments_scheduler.update_schedule(
            post_ids=request.post_ids,
            new_cron_schedule=request.cron_schedule
        )

        return SchedulerResponse(
            status="success",
            message=f"Comments schedule updated successfully for {len(request.post_ids)} posts",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error updating comments scheduler schedule: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update comments scheduler schedule: {str(e)}"
        )

@router.post("/scheduler/comments/add-posts")
async def add_posts_to_comments_scheduler(
    post_ids: List[str],
    settings = Depends(get_settings),
):
    """Add new post IDs to the comments scheduler"""
    try:
        if not facebook_comments_scheduler.is_running():
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        facebook_comments_scheduler.add_post_ids(post_ids)

        return SchedulerResponse(
            status="success",
            message=f"Added {len(post_ids)} post IDs to comments scheduler",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error adding posts to comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add posts to comments scheduler: {str(e)}"
        )

@router.post("/scheduler/comments/remove-posts")
async def remove_posts_from_comments_scheduler(
    post_ids: List[str],
    settings = Depends(get_settings),
):
    """Remove post IDs from the comments scheduler"""
    try:
        if not facebook_comments_scheduler.is_running():
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        facebook_comments_scheduler.remove_post_ids(post_ids)

        return SchedulerResponse(
            status="success",
            message=f"Removed {len(post_ids)} post IDs from comments scheduler",
            jobs_info=facebook_comments_scheduler.get_jobs_info()
        )

    except Exception as e:
        logger.error(f"Error removing posts from comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove posts from comments scheduler: {str(e)}"
        )


