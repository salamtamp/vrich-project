import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.constants.facebook_post import (
    ERR_FACEBOOK_POST_DUPLICATE_ID,
    ERR_FACEBOOK_POST_NOT_FOUND,
)
from app.db.models.facebook_post import FacebookPost as FacebookPostModel
from app.db.models.facebook_profile import FacebookProfile as FacebookProfileModel
from app.db.repositories.facebook_post.repo import facebook_post_repo
from app.db.session import get_db
from app.schemas.facebook_post import (
    FacebookPost,
    FacebookPostCreate,
    FacebookPostUpdate,
)

router = APIRouter()
logger = logging.getLogger("app.api.v1.endpoints.facebook_post")


@router.get("/", response_model=PaginationResponse[FacebookPost])
def list_facebook_posts(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[FacebookPost]:
    builder = PaginationBuilder(FacebookPostModel, db)
    builder.query = builder.query.options(joinedload(FacebookPostModel.profile))
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=FacebookPost)
    )


@router.get("/{post_id}", response_model=FacebookPost)
def get_facebook_post(
    post_id: UUID,
    db: Session = Depends(get_db),
) -> FacebookPost:
    post = db.query(FacebookPostModel).filter(FacebookPostModel.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_POST_NOT_FOUND)
    return post


@router.post("/", response_model=FacebookPost, status_code=status.HTTP_201_CREATED)
def create_facebook_post(
    *, db: Session = Depends(get_db), post_in: FacebookPostCreate
) -> FacebookPost:
    profile = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == post_in.profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Referenced FacebookProfile does not exist.",
        )
    existing = (
        db.query(FacebookPostModel)
        .filter(
            FacebookPostModel.profile_id == post_in.profile_id,
            FacebookPostModel.post_id == post_in.post_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=ERR_FACEBOOK_POST_DUPLICATE_ID,
        )
    return facebook_post_repo.create(db, obj_in=post_in)


@router.put("/{post_id}", response_model=FacebookPost)
def update_facebook_post(
    *, db: Session = Depends(get_db), post_id: UUID, post_in: FacebookPostUpdate
) -> FacebookPost:
    db_obj = db.query(FacebookPostModel).filter(FacebookPostModel.id == post_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_POST_NOT_FOUND)

    if post_in.profile_id is not None:
        profile = (
            db.query(FacebookProfileModel)
            .filter(FacebookProfileModel.id == post_in.profile_id)
            .first()
        )
        if not profile:
            raise HTTPException(
                status_code=400,
                detail="Referenced FacebookProfile does not exist.",
            )
        existing = (
            db.query(FacebookPostModel)
            .filter(
                FacebookPostModel.profile_id == post_in.profile_id,
                FacebookPostModel.post_id == db_obj.post_id,
                FacebookPostModel.id != post_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=ERR_FACEBOOK_POST_DUPLICATE_ID,
            )

    if post_in.status == "active":
        other_active_posts = (
            db.query(FacebookPostModel)
            .filter(
                FacebookPostModel.status == "active",
                FacebookPostModel.id != post_id,
            )
            .all()
        )
        for other_post in other_active_posts:
            other_post.status = "inactive"
        db.flush()
    for field, value in post_in.model_dump(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.delete("/{post_id}", response_model=FacebookPost)
def delete_facebook_post(
    *, db: Session = Depends(get_db), post_id: UUID
) -> FacebookPost:
    db_obj = db.query(FacebookPostModel).filter(FacebookPostModel.id == post_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_POST_NOT_FOUND)
    db.delete(db_obj)
    db.commit()
    return db_obj
