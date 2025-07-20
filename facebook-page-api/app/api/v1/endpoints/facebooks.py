from app.core.config import get_settings
from app.schedule.facebook_posts import (
    start_posts_scheduler,
    stop_posts_scheduler,
    restart_posts_scheduler,
    get_posts_scheduler_status,
)
from app.schedule.facebook_comments import (
    start_comments_scheduler,
    stop_comments_scheduler,
    restart_comments_scheduler,
    get_comments_scheduler_status,
    update_comments_scheduler_schedule,
)
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List, Optional, Union

import logging
import httpx

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
    model_config = ConfigDict(populate_by_name=True)

    page_id: str = Field(alias="pageId")
    schedule: Union[str, int] = Field(default="0 * * * *", alias="schedule")
    trigger_type: str = Field(default="cron", alias="triggerType")

class CommentsSchedulerRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    post_ids: List[str] = Field(alias="postIds")
    schedule: Union[str, int] = Field(default=300, alias="schedule")
    trigger_type: str = Field(default="interval", alias="triggerType")

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
                # Create proper FacebookCommentResponse objects
                comment_obj = FacebookCommentResponse(
                    id=comment.get("id"),
                    created_time=comment.get("created_time"),
                    message=comment.get("message", ""),
                    from_user=comment.get("from", {}).get("name", "UNKNOWN") if comment.get("from") else "UNKNOWN"
                )
                comments.append(comment_obj)

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

@router.post("/scheduler/posts/start", response_model=SchedulerResponse)
async def start_facebook_posts_scheduler(
    request: PostsSchedulerRequest,
    settings = Depends(get_settings),
):
    try:
        result = await start_posts_scheduler(
            page_id=request.page_id,
            schedule=request.schedule,
            trigger_type=request.trigger_type,
            settings=settings
        )

        if result:
            return SchedulerResponse(
                status="success",
                message=f"Posts scheduler started successfully for page {request.page_id}"
            )
        else:
            return SchedulerResponse(
                status="error",
                message=f"Failed to start posts scheduler for page {request.page_id}"
            )

    except Exception as e:
        logger.error(f"Error starting posts scheduler: {str(e)}")
        return SchedulerResponse(
            status="error",
            message=f"Error starting posts scheduler: {str(e)}"
        )

@router.post("/scheduler/posts/stop", response_model=SchedulerResponse)
async def stop_facebook_posts_scheduler():
    try:
        result = await stop_posts_scheduler()

        if result:
            return SchedulerResponse(
                status="success",
                message="Posts scheduler stopped successfully"
            )
        else:
            return SchedulerResponse(
                status="error",
                message="Failed to stop posts scheduler"
            )

    except Exception as e:
        logger.error(f"Error stopping posts scheduler: {str(e)}")
        return SchedulerResponse(
            status="error",
            message=f"Error stopping posts scheduler: {str(e)}"
        )

@router.post("/scheduler/posts/restart", response_model=SchedulerResponse)
async def restart_facebook_posts_scheduler(
    request: PostsSchedulerRequest,
    settings = Depends(get_settings),
):
    try:
        result = await restart_posts_scheduler(
            page_id=request.page_id,
            schedule=request.schedule,
            trigger_type=request.trigger_type,
            settings=settings
        )

        if result:
            return SchedulerResponse(
                status="success",
                message=f"Posts scheduler restarted successfully for page {request.page_id}"
            )
        else:
            return SchedulerResponse(
                status="error",
                message=f"Failed to restart posts scheduler for page {request.page_id}"
            )

    except Exception as e:
        logger.error(f"Error restarting posts scheduler: {str(e)}")
        return SchedulerResponse(
            status="error",
            message=f"Error restarting posts scheduler: {str(e)}"
        )

@router.get("/scheduler/posts/status", response_model=SchedulerResponse)
async def get_posts_scheduler_status_endpoint():  # Rename the function to avoid conflict
    try:
        status_info = await get_posts_scheduler_status()  # This now calls the imported function

        return SchedulerResponse(
            status="success",
            message="Posts scheduler status retrieved successfully",
            jobs_info=status_info
        )

    except Exception as e:
        logger.error(f"Error getting posts scheduler status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get posts scheduler status: {str(e)}"
        )


@router.post("/scheduler/comments/start", response_model=SchedulerResponse)
async def start_facebook_comments_scheduler(
    request: CommentsSchedulerRequest,
    settings = Depends(get_settings),
):
    try:
        # Get current status to check if already running
        current_status = await get_comments_scheduler_status()
        if current_status.get("fetch_comments", {}).get("status") == "running":
            return SchedulerResponse(
                status="error",
                message="Comments scheduler is already running"
            )

        success = await start_comments_scheduler(
            post_ids=request.post_ids,
            cron_schedule=request.schedule,
            trigger_type=request.trigger_type
        )

        if success:
            jobs_info = await get_comments_scheduler_status()
            return SchedulerResponse(
                status="success",
                message=f"Comments scheduler started successfully for {len(request.post_ids)} posts",
                jobs_info=jobs_info
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to start comments scheduler"
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
        # Get current status to check if running
        current_status = await get_comments_scheduler_status()
        if current_status.get("fetch_comments", {}).get("status") != "running":
            return SchedulerResponse(
                status="error",
                message="Comments scheduler is not running"
            )

        success = await stop_comments_scheduler()

        if success:
            jobs_info = await get_comments_scheduler_status()
            return SchedulerResponse(
                status="success",
                message="Comments scheduler stopped successfully",
                jobs_info=jobs_info
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to stop comments scheduler"
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
        success = await restart_comments_scheduler(
            post_ids=request.post_ids,
            cron_schedule=request.schedule,
            trigger_type=request.trigger_type
        )

        if success:
            jobs_info = await get_comments_scheduler_status()
            return SchedulerResponse(
                status="success",
                message=f"Comments scheduler restarted successfully for {len(request.post_ids)} posts",
                jobs_info=jobs_info
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to restart comments scheduler"
            )

    except Exception as e:
        logger.error(f"Error restarting comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to restart comments scheduler: {str(e)}"
        )

@router.get("/scheduler/comments/status", response_model=SchedulerResponse)
async def get_comments_scheduler_status_endpoint():
    """Get the current status of the Facebook comments scheduler"""
    try:
        jobs_info = await get_comments_scheduler_status()
        return SchedulerResponse(
            status="success",
            message="Comments scheduler status retrieved successfully",
            jobs_info=jobs_info
        )

    except Exception as e:
        logger.error(f"Error getting comments scheduler status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get comments scheduler status: {str(e)}"
        )

@router.post("/scheduler/comments/update", response_model=SchedulerResponse)
async def update_comments_scheduler_schedule_endpoint(
    request: CommentsSchedulerRequest,
    settings = Depends(get_settings),
):
    """Update the cron schedule for the running comments scheduler"""
    try:
        # Get current status to check if running
        current_status = await get_comments_scheduler_status()
        if current_status.get("fetch_comments", {}).get("status") != "running":
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        update_comments_scheduler_schedule(
            post_ids=request.post_ids,
            new_cron_schedule=request.schedule,
            trigger_type=request.trigger_type
        )

        jobs_info = await get_comments_scheduler_status()
        return SchedulerResponse(
            status="success",
            message=f"Comments schedule updated successfully for {len(request.post_ids)} posts",
            jobs_info=jobs_info
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
        # Get current status to check if running
        current_status = await get_comments_scheduler_status()
        if current_status.get("fetch_comments", {}).get("status") != "running":
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        add_posts_to_comments_scheduler(post_ids)

        jobs_info = await get_comments_scheduler_status()
        return SchedulerResponse(
            status="success",
            message=f"Added {len(post_ids)} post IDs to comments scheduler",
            jobs_info=jobs_info
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
        # Get current status to check if running
        current_status = await get_comments_scheduler_status()
        if current_status.get("fetch_comments", {}).get("status") != "running":
            raise HTTPException(
                status_code=400,
                detail="Comments scheduler is not running. Start it first."
            )

        remove_posts_from_comments_scheduler(post_ids)

        jobs_info = await get_comments_scheduler_status()
        return SchedulerResponse(
            status="success",
            message=f"Removed {len(post_ids)} post IDs from comments scheduler",
            jobs_info=jobs_info
        )

    except Exception as e:
        logger.error(f"Error removing posts from comments scheduler: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to remove posts from comments scheduler: {str(e)}"
        )


