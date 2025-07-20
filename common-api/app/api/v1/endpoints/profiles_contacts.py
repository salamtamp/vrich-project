from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.profiles_contacts import ProfileContact as ProfileContactModel
from app.db.repositories.profiles_contacts.repo import profile_contact_repo
from app.db.session import get_db
from app.schemas.profiles_contacts import (
    ProfileContact,
    ProfileContactCreate,
    ProfileContactUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[ProfileContact])
def list_profile_contacts(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[ProfileContact]:
    builder = PaginationBuilder(ProfileContactModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=ProfileContact)
    )


@router.get("/{contact_id}", response_model=ProfileContact)
def get_profile_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
) -> ProfileContact:
    contact = (
        db.query(ProfileContactModel)
        .filter(ProfileContactModel.id == contact_id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="ProfileContact not found")
    return contact


@router.post("/", response_model=ProfileContact, status_code=status.HTTP_201_CREATED)
def create_profile_contact(
    *, db: Session = Depends(get_db), contact_in: ProfileContactCreate
) -> ProfileContact:
    return profile_contact_repo.create(db, obj_in=contact_in)


@router.put("/{contact_id}", response_model=ProfileContact)
def update_profile_contact(
    *, db: Session = Depends(get_db), contact_id: UUID, contact_in: ProfileContactUpdate
) -> ProfileContact:
    db_obj = (
        db.query(ProfileContactModel)
        .filter(ProfileContactModel.id == contact_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="ProfileContact not found")
    return profile_contact_repo.update(db, db_obj=db_obj, obj_in=contact_in)


@router.delete("/{contact_id}", response_model=ProfileContact)
def delete_profile_contact(
    *, db: Session = Depends(get_db), contact_id: UUID
) -> ProfileContact:
    db_obj = (
        db.query(ProfileContactModel)
        .filter(ProfileContactModel.id == contact_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="ProfileContact not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
