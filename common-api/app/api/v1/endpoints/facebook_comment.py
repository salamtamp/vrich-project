from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
import sqlalchemy as sa
from datetime import datetime, UTC

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.constants.facebook_comment import (
    ERR_FACEBOOK_COMMENT_DUPLICATE_ID,
    ERR_FACEBOOK_COMMENT_NOT_FOUND,
    ERR_FACEBOOK_COMMENT_POST_NOT_FOUND,
    ERR_FACEBOOK_COMMENT_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_comment import FacebookComment as FacebookCommentModel
from app.db.models.facebook_post import FacebookPost as FacebookPostModel
from app.db.models.facebook_profile import FacebookProfile as FacebookProfileModel
from app.db.repositories.facebook_comment.repo import facebook_comment_repo
from app.db.session import get_db
from app.schemas.facebook_comment import (
    FacebookComment,
    FacebookCommentCreate,
    FacebookCommentUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[FacebookComment])
def list_facebook_comments(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
    post_id: str | None = None,
    profile_id: str | None = None,
    group_by: str | None = None,
) -> PaginationResponse[FacebookComment]:
    if group_by == "profile_id":
        sub = (
            db.query(
                FacebookCommentModel.profile_id.label("profile_id"),
                sa.func.max(FacebookCommentModel.published_at).label("max_published_at"),
            )
            .filter(FacebookCommentModel.deleted_at.is_(None))
            .group_by(FacebookCommentModel.profile_id)
            .subquery()
        )

        base_q = (
            db.query(FacebookCommentModel)
            .options(
                joinedload(FacebookCommentModel.profile),
                joinedload(FacebookCommentModel.post),
            )
            .join(
                sub,
                sa.and_(
                    FacebookCommentModel.profile_id == sub.c.profile_id,
                    FacebookCommentModel.published_at == sub.c.max_published_at,
                ),
            )
            .order_by(FacebookCommentModel.published_at.desc())
        )

        total = db.query(sa.func.count(sub.c.profile_id)).scalar() or 0
        q = base_q.offset(pagination.offset)
        if pagination.limit is not None:
            q = q.limit(pagination.limit)
        rows = q.all()
        docs = [FacebookComment.model_validate(r) for r in rows]
        has_next = False if pagination.limit is None else (pagination.offset + pagination.limit) < total
        return PaginationResponse[FacebookComment](
            total=total,
            docs=docs,
            limit=pagination.limit or len(docs),
            offset=pagination.offset,
            has_next=has_next,
            has_prev=pagination.offset > 0,
            timestamp=datetime.now(UTC),
        )

    builder = PaginationBuilder(FacebookCommentModel, db)
    builder.query = builder.query.options(
        joinedload(FacebookCommentModel.profile), joinedload(FacebookCommentModel.post)
    )
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .custom_filter(post_id=post_id, profile_id=profile_id)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=FacebookComment)
    )


@router.get("/{comment_id}", response_model=FacebookComment)
def get_facebook_comment(
    comment_id: str,
    db: Session = Depends(get_db),
) -> FacebookComment:
    comment = (
        db.query(FacebookCommentModel)
        .options(
            joinedload(FacebookCommentModel.profile),
            joinedload(FacebookCommentModel.post),
        )
        .filter(FacebookCommentModel.comment_id == comment_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_COMMENT_NOT_FOUND)
    return comment


@router.post("/", response_model=FacebookComment, status_code=status.HTTP_201_CREATED)
def create_facebook_comment(
    *, db: Session = Depends(get_db), comment_in: FacebookCommentCreate
) -> FacebookComment:
    profile = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == comment_in.profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=400, detail=ERR_FACEBOOK_COMMENT_PROFILE_NOT_FOUND
        )
    post = (
        db.query(FacebookPostModel)
        .filter(FacebookPostModel.id == comment_in.post_id)
        .first()
    )
    if not post:
        raise HTTPException(status_code=400, detail=ERR_FACEBOOK_COMMENT_POST_NOT_FOUND)
    existing = (
        db.query(FacebookCommentModel)
        .filter(FacebookCommentModel.comment_id == comment_in.comment_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail=ERR_FACEBOOK_COMMENT_DUPLICATE_ID)
    return facebook_comment_repo.create(db, obj_in=comment_in)


@router.put("/{comment_id}", response_model=FacebookComment)
def update_facebook_comment(
    *, db: Session = Depends(get_db), comment_id: str, comment_in: FacebookCommentUpdate
) -> FacebookComment:
    db_obj = (
        db.query(FacebookCommentModel)
        .filter(FacebookCommentModel.comment_id == comment_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_COMMENT_NOT_FOUND)
    return facebook_comment_repo.update(db, db_obj=db_obj, obj_in=comment_in)


@router.delete("/{comment_id}", response_model=FacebookComment)
def delete_facebook_comment(
    *, db: Session = Depends(get_db), comment_id: str
) -> FacebookComment:
    db_obj = (
        db.query(FacebookCommentModel)
        .filter(FacebookCommentModel.comment_id == comment_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_COMMENT_NOT_FOUND)
    db.delete(db_obj)
    db.commit()
    return db_obj
