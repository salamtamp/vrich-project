from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants.facebook_profile import (
    ERR_FACEBOOK_PROFILE_DUPLICATE_ID,
    ERR_FACEBOOK_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_profile import FacebookProfile as FacebookProfileModel
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.session import get_db
from app.schemas.facebook_profile import (
    FacebookProfile,
    FacebookProfileCreate,
    FacebookProfileUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[FacebookProfile])
def list_facebook_profiles(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(FacebookProfileModel).offset(skip).limit(limit).all()


@router.get("/{profile_id}", response_model=FacebookProfile)
def get_facebook_profile(
    profile_id: UUID,
    db: Session = Depends(get_db),
) -> Any:
    profile = (
        db.query(FacebookProfileModel)
        .filter(FacebookProfileModel.id == profile_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail=ERR_FACEBOOK_PROFILE_NOT_FOUND)
    return profile


@router.post("/", response_model=FacebookProfile, status_code=status.HTTP_201_CREATED)
def create_facebook_profile(
    *, db: Session = Depends(get_db), profile_in: FacebookProfileCreate
) -> Any:
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
) -> Any:
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
def delete_facebook_profile(*, db: Session = Depends(get_db), profile_id: UUID) -> Any:
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
