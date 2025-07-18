from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.db.models.user import User

from .user_query import get_by_email


def authenticate_user(db: Session, *, email: str, password: str) -> User | None:
    user = get_by_email(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user
