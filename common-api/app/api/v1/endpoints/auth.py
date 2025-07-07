import logging

from fastapi import APIRouter, Body, Depends, Form, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.dependencies import database as deps
from app.constants.auth import (
    ERR_EMAIL_OR_USERNAME_REQUIRED,
    ERR_INCORRECT_EMAIL_OR_PASSWORD,
    ERR_USER_ALREADY_REGISTERED,
)
from app.core import security
from app.db.repositories.user import user_repo
from app.db.session import get_db
from app.schemas import user as user_schema

router = APIRouter()
logger = logging.getLogger("app.api.v1.endpoints.auth")


class LoginRequest(BaseModel):
    email: str | None = None
    username: str | None = None
    password: str


@router.post("/login", response_model=user_schema.Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
    email: str = Form(None),
    username: str = Form(None),
    password: str = Form(None),
    json_body: LoginRequest = Body(None),
) -> dict[str, str]:
    """
    Email/password login, get an access token for future requests.
    Accepts either form data or JSON. Accepts 'email' or 'username' for compatibility.
    """
    try:
        body = await request.body()
        logger.info(f"Login request raw body: {body}")
    except Exception as e:
        logger.warning(f"Could not read request body: {e}")
    if json_body:
        email = json_body.email or json_body.username
        password = json_body.password
    if not email and username:
        email = username
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=ERR_EMAIL_OR_USERNAME_REQUIRED,
        )
    user = user_repo.authenticate(db, email=email, password=password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERR_INCORRECT_EMAIL_OR_PASSWORD,
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
) -> user_schema.User:
    """
    Create new user via public registration.
    """
    user = user_repo.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail=ERR_USER_ALREADY_REGISTERED,
        )

    return user_repo.create(db, obj_in=user_in)


@router.post("/test-token", response_model=user_schema.User)
def test_token(
    current_user: user_schema.User = Depends(deps.get_current_user),
) -> user_schema.User:
    """
    Test access token
    """
    return current_user
