from app.core.config import get_settings
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

import httpx

router = APIRouter()

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
                comments.append(FacebookCommentResponse(
                    id=comment.get("id"),
                    message=comment.get("message", ""),
                    created_time=comment.get("created_time"),
                    from_user=comment.get("from", {}).get("name", "UNKNOWN") if comment.get("from") else "UNKNOWN"
                ))

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


