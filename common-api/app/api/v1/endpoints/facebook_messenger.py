from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.constants.facebook_messenger import (
    ERR_FACEBOOK_MESSENGER_DUPLICATE_ID,
    ERR_FACEBOOK_MESSENGER_NOT_FOUND,
    ERR_FACEBOOK_MESSENGER_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_messenger import FacebookMessenger as FacebookMessengerModel
from app.db.models.facebook_profile import FacebookProfile as FacebookProfileModel
from app.db.repositories.facebook_messenger.repo import facebook_messenger_repo
from app.db.session import get_db
from app.schemas.facebook_messenger import (
    FacebookMessenger,
    FacebookMessengerCreate,
    FacebookMessengerUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[FacebookMessenger])
def list_facebook_messengers(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
    profile_id: str | None = None,
) -> PaginationResponse[FacebookMessenger]:
    builder = PaginationBuilder(FacebookMessengerModel, db)
    builder.query = builder.query.options(joinedload(FacebookMessengerModel.profile))
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .custom_filter(profile_id=profile_id)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=FacebookMessenger)
    )


@router.get("/{messenger_id}", response_model=FacebookMessenger)
def get_facebook_messenger(
    messenger_id: UUID,
    db: Session = Depends(get_db),
) -> FacebookMessenger:
    messenger = (
        db.query(FacebookMessengerModel)
        .options(joinedload(FacebookMessengerModel.profile))
        .filter(FacebookMessengerModel.id == messenger_id)
        .first()
    )
    if not messenger:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_MESSENGER_NOT_FOUND)
    return messenger


@router.post("/", response_model=FacebookMessenger, status_code=status.HTTP_201_CREATED)
def create_facebook_messenger(
    *, db: Session = Depends(get_db), messenger_in: FacebookMessengerCreate
) -> FacebookMessenger:
    # Validate ForeignKey
    profile = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == messenger_in.profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=400, detail=ERR_FACEBOOK_MESSENGER_PROFILE_NOT_FOUND
        )
    # Validate uniqueness
    existing = (
        db.query(FacebookMessengerModel)
        .filter(FacebookMessengerModel.messenger_id == messenger_in.messenger_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail=ERR_FACEBOOK_MESSENGER_DUPLICATE_ID)
    return facebook_messenger_repo.create(db, obj_in=messenger_in)


@router.put("/{messenger_id}", response_model=FacebookMessenger)
def update_facebook_messenger(
    *,
    db: Session = Depends(get_db),
    messenger_id: UUID,
    messenger_in: FacebookMessengerUpdate,
) -> FacebookMessenger:
    db_obj = (
        db.query(FacebookMessengerModel)
        .filter(FacebookMessengerModel.id == messenger_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_MESSENGER_NOT_FOUND)
    # Uniqueness check is not needed since messenger_id is not updatable
    return facebook_messenger_repo.update(db, db_obj=db_obj, obj_in=messenger_in)


@router.delete("/{messenger_id}", response_model=FacebookMessenger)
def delete_facebook_messenger(
    *, db: Session = Depends(get_db), messenger_id: UUID
) -> FacebookMessenger:
    db_obj = (
        db.query(FacebookMessengerModel)
        .filter(FacebookMessengerModel.id == messenger_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_MESSENGER_NOT_FOUND)
    db.delete(db_obj)
    db.commit()
    return db_obj
