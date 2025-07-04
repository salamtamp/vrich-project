from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.dependencies import database as deps
from app.core import security
from app.db.repositories.user import user_repo
from app.db.session import get_db
from app.schemas import user as user_schema

router = APIRouter()


@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = user_repo.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/register", response_model=user_schema.User, status_code=status.HTTP_201_CREATED
)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: user_schema.UserCreate,
) -> Any:
    """
    Create new user via public registration.
    """
    user = user_repo.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already registered in the system.",
        )

    user = user_repo.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already registered in the system.",
        )

    return user_repo.create(db, obj_in=user_in)


@router.post("/test-token", response_model=user_schema.User)
def test_token(current_user: user_schema.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
