from datetime import UTC, datetime
from uuid import UUID

import sqlalchemy as sa
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.database import get_db
from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.constants.facebook_messenger import (
    ERR_FACEBOOK_INBOX_DUPLICATE_ID,
    ERR_FACEBOOK_INBOX_NOT_FOUND,
    ERR_FACEBOOK_INBOX_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_inbox import FacebookInbox as FacebookInboxModel
from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.facebook_inbox.repo import facebook_inbox_repo
from app.schemas.facebook_messenger import (
    FacebookInbox,
    FacebookInboxCreate,
    FacebookInboxUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[FacebookInbox])
def list_facebook_inboxes(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
    profile_id: str | None = None,
    messenger_id: str | None = None,
    group_by: str | None = None,
    before_created_at: str | None = None,
) -> PaginationResponse[FacebookInbox]:
    if group_by == "profile_id":
        sub = (
            db.query(
                FacebookInboxModel.profile_id.label("profile_id"),
                sa.func.max(FacebookInboxModel.published_at).label("max_published_at"),
            )
            .filter(FacebookInboxModel.deleted_at.is_(None))
            .group_by(FacebookInboxModel.profile_id)
            .subquery()
        )

        base_q = (
            db.query(FacebookInboxModel)
            .options(joinedload(FacebookInboxModel.profile))
            .join(
                sub,
                sa.and_(
                    FacebookInboxModel.profile_id == sub.c.profile_id,
                    FacebookInboxModel.published_at == sub.c.max_published_at,
                ),
            )
            .filter(FacebookInboxModel.deleted_at.is_(None))
            .order_by(FacebookInboxModel.published_at.desc())
        )

        if before_created_at:
            try:
                before_date = datetime.fromisoformat(before_created_at.replace('Z', '+00:00'))
                base_q = base_q.filter(FacebookInboxModel.created_at < before_date)
            except ValueError:
                pass

        # Manual paginate
        total = db.query(sa.func.count(sub.c.profile_id)).scalar() or 0
        q = base_q.offset(pagination.offset)
        if pagination.limit is not None:
            q = q.limit(pagination.limit)
        rows = q.all()
        docs = [FacebookInbox.model_validate(r) for r in rows]
        has_next = False if pagination.limit is None else (pagination.offset + pagination.limit) < total
        return PaginationResponse[FacebookInbox](
            total=total,
            docs=docs,
            limit=pagination.limit or len(docs),
            offset=pagination.offset,
            has_next=has_next,
            has_prev=pagination.offset > 0,
            timestamp=datetime.now(UTC),
        )

    builder = PaginationBuilder(FacebookInboxModel, db)
    builder.query = builder.query.options(joinedload(FacebookInboxModel.profile))
    
    if before_created_at:
        try:
            before_date = datetime.fromisoformat(before_created_at.replace('Z', '+00:00'))
            builder.query = builder.query.filter(FacebookInboxModel.created_at < before_date)
        except ValueError:
            pass
    
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .custom_filter(profile_id=profile_id, messenger_id=messenger_id)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=FacebookInbox)
    )


@router.get("/{inbox_id}", response_model=FacebookInbox)
def get_facebook_inbox(
    *,
    db: Session = Depends(get_db),
    inbox_id: UUID,
) -> FacebookInbox:
    db_obj = (
        db.query(FacebookInboxModel)
        .options(joinedload(FacebookInboxModel.profile))
        .filter(FacebookInboxModel.id == str(inbox_id))
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_INBOX_NOT_FOUND)
    return FacebookInbox.model_validate(db_obj)


@router.post("/", response_model=FacebookInbox, status_code=status.HTTP_201_CREATED)
def create_facebook_inbox(
    *, db: Session = Depends(get_db), inbox_in: FacebookInboxCreate
) -> FacebookInbox:
    # Check if profile exists
    profile = (
        db.query(FacebookProfile)
        .filter(FacebookProfile.id == inbox_in.profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=400, detail=ERR_FACEBOOK_INBOX_PROFILE_NOT_FOUND
        )

    # Check if messenger_id already exists
    existing_inbox = (
        db.query(FacebookInboxModel)
        .filter(FacebookInboxModel.messenger_id == inbox_in.messenger_id)
        .first()
    )
    if existing_inbox:
        raise HTTPException(status_code=400, detail=ERR_FACEBOOK_INBOX_DUPLICATE_ID)
    return facebook_inbox_repo.create(db, obj_in=inbox_in)


@router.put("/{inbox_id}", response_model=FacebookInbox)
def update_facebook_inbox(
    *,
    db: Session = Depends(get_db),
    inbox_id: UUID,
    inbox_in: FacebookInboxUpdate,
) -> FacebookInbox:
    db_obj = (
        db.query(FacebookInboxModel)
        .filter(FacebookInboxModel.id == str(inbox_id))
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_INBOX_NOT_FOUND)
    return facebook_inbox_repo.update(db, db_obj=db_obj, obj_in=inbox_in)


@router.delete("/{inbox_id}", response_model=FacebookInbox)
def delete_facebook_inbox(
    *,
    db: Session = Depends(get_db),
    inbox_id: UUID,
) -> FacebookInbox:
    db_obj = (
        db.query(FacebookInboxModel)
        .filter(FacebookInboxModel.id == str(inbox_id))
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_INBOX_NOT_FOUND)
    return facebook_inbox_repo.remove(db, id=str(inbox_id))
