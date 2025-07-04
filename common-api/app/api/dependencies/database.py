from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import models
from app.db.repositories.user import user_repo
from app.db.session import get_db
from app.schemas.user import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

bearer_scheme = HTTPBearer()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError) as err:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        ) from err
    user = user_repo.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def store_current_user(
    request: Request, current_user: models.User = Depends(get_current_user)
):
    """Store current user in request state for later access"""
    request.state.current_user = current_user
    return current_user


def get_current_user_from_request(request: Request) -> models.User:
    """Get current user from request state"""
    return request.state.current_user
