from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.models.user import User
from app.schemas.user import UserCreate


def create_user(db: Session, *, obj_in: UserCreate) -> User:
    db_obj = User(
        email=obj_in.email,
        username=obj_in.username,
        full_name=obj_in.full_name,
        hashed_password=get_password_hash(obj_in.password),
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
