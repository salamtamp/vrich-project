from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import database as deps
from app.db import models
from app.db.repositories.user import user_repo
from app.db.session import get_db
from app.schemas import user as user_schema

router = APIRouter()


@router.get("/", response_model=list[user_schema.User])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve users.
    """
    return user_repo.get_multi(db, skip=skip, limit=limit)


@router.post("/", response_model=user_schema.User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: user_schema.UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = user_repo.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = user_repo.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    return user_repo.create(db, obj_in=user_in)


@router.get("/me", response_model=user_schema.User)
def read_user_me(
    request: Request,
) -> Any:
    """
    Get current user.
    """
    return deps.get_current_user_from_request(request)


@router.put("/me", response_model=user_schema.User)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: user_schema.UserUpdate,
    current_user: models.User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    return user_repo.update(db, db_obj=current_user, obj_in=user_in)


@router.get("/{user_id}", response_model=user_schema.User)
def read_user_by_id(
    user_id: UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific user by id.
    """
    return user_repo.get(db, id=str(user_id))


@router.put("/{user_id}", response_model=user_schema.User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: UUID,
    user_in: user_schema.UserUpdate,
) -> Any:
    """
    Update a user.
    """
    user = user_repo.get(db, id=str(user_id))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return user_repo.update(db, db_obj=user, obj_in=user_in)


@router.delete("/{user_id}", response_model=user_schema.User)
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: UUID,
) -> Any:
    """
    Delete a user.
    """
    user = user_repo.get(db, id=str(user_id))
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    return user_repo.remove(db, id=str(user_id))
