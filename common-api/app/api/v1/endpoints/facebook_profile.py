from uuid import UUID

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
from app.constants.facebook_profile import (
    ERR_FACEBOOK_PROFILE_DUPLICATE_ID,
    ERR_FACEBOOK_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_profile import FacebookProfile as FacebookProfileModel
from app.db.models.facebook_comment import FacebookComment as FacebookCommentModel
from app.db.models.facebook_inbox import FacebookInbox as FacebookInboxModel
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.session import get_db
from app.schemas.facebook_profile import (
    FacebookProfile,
    FacebookProfileCreate,
    FacebookProfileUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[FacebookProfile])
def list_facebook_profiles(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[FacebookProfile]:
    builder = PaginationBuilder(FacebookProfileModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=FacebookProfile)
    )


@router.get("/{profile_id}", response_model=FacebookProfile)
def get_facebook_profile(
    profile_id: UUID,
    db: Session = Depends(get_db),
) -> FacebookProfile:
    profile = db.query(FacebookProfileModel).filter(FacebookProfileModel.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_PROFILE_NOT_FOUND)
    return profile


@router.get("/{profile_id}/with-relations")
def get_facebook_profile_with_relations(
    profile_id: UUID,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    profile = (
        db.query(FacebookProfileModel)
        .options(joinedload(FacebookProfileModel.profiles_contacts))
        .filter(FacebookProfileModel.id == profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_PROFILE_NOT_FOUND)

    inbox_builder = PaginationBuilder(FacebookInboxModel, db)
    inbox_builder.query = inbox_builder.query.options(joinedload(FacebookInboxModel.profile))
    inboxes = (
        inbox_builder
        .filter_deleted()
        .custom_filter(profile_id=str(profile_id))
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset)
    )

    comment_builder = PaginationBuilder(FacebookCommentModel, db)
    comment_builder.query = comment_builder.query.options(
        joinedload(FacebookCommentModel.profile), joinedload(FacebookCommentModel.post)
    )
    comments = (
        comment_builder
        .filter_deleted()
        .custom_filter(profile_id=str(profile_id))
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset)
    )

    return {
        "profile": FacebookProfile.model_validate(profile),
        "inboxes": inboxes,
        "comments": comments,
    }


@router.get("/{profile_id}/timeline")
def get_profile_timeline(
    profile_id: UUID,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    inbox_q = (
        db.query(FacebookInboxModel)
        .filter(FacebookInboxModel.profile_id == str(profile_id), FacebookInboxModel.deleted_at.is_(None))
        .order_by(FacebookInboxModel.published_at.desc())
    )
    comment_q = (
        db.query(FacebookCommentModel)
        .filter(FacebookCommentModel.profile_id == str(profile_id), FacebookCommentModel.deleted_at.is_(None))
        .order_by(FacebookCommentModel.published_at.desc())
    )

    inbox_items = [
        {
            "id": str(i.id),
            "source": "inbox",
            "text": i.message or "",
            "timestamp": i.published_at,
        }
        for i in inbox_q.all()
    ]
    comment_items = [
        {
            "id": str(c.id),
            "source": "comment",
            "text": c.message or "",
            "timestamp": c.published_at,
        }
        for c in comment_q.all()
    ]

    merged = sorted(inbox_items + comment_items, key=lambda x: x["timestamp"], reverse=True)

    total = len(merged)
    start_idx = pagination.offset or 0
    limit = pagination.limit if pagination.limit is not None else total
    end_idx = start_idx + limit
    docs = merged[start_idx:end_idx]
    has_next = False if pagination.limit is None else (start_idx + limit) < total
    has_prev = start_idx > 0

    return {
        "total": total,
        "docs": [
            {
                **d,
                "timestamp": d["timestamp"].isoformat() if hasattr(d["timestamp"], "isoformat") else d["timestamp"],
            }
            for d in docs
        ],
        "limit": limit,
        "offset": start_idx,
        "has_next": has_next,
        "has_prev": has_prev,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@router.post("/", response_model=FacebookProfile, status_code=status.HTTP_201_CREATED)
def create_facebook_profile(
    *, db: Session = Depends(get_db), profile_in: FacebookProfileCreate
) -> FacebookProfile:
    existing = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.facebook_id == profile_in.facebook_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail=ERR_FACEBOOK_PROFILE_DUPLICATE_ID,
        )
    return facebook_profile_repo.create(db, obj_in=profile_in)


@router.put("/{profile_id}", response_model=FacebookProfile)
def update_facebook_profile(
    *,
    db: Session = Depends(get_db),
    profile_id: UUID,
    profile_in: FacebookProfileUpdate,
) -> FacebookProfile:
    db_obj = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == profile_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_PROFILE_NOT_FOUND)
    if profile_in.facebook_id is not None:
        existing = (
            db.query(FacebookProfileModel)
            .filter(
                FacebookProfileModel.facebook_id == profile_in.facebook_id,
                FacebookProfileModel.id != profile_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=400,
                detail=ERR_FACEBOOK_PROFILE_DUPLICATE_ID,
            )
    return facebook_profile_repo.update(db, db_obj=db_obj, obj_in=profile_in)


@router.delete("/{profile_id}", response_model=FacebookProfile)
def delete_facebook_profile(
    *, db: Session = Depends(get_db), profile_id: UUID
) -> FacebookProfile:
    db_obj = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == profile_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_PROFILE_NOT_FOUND)
    db.delete(db_obj)
    db.commit()
    return db_obj
