
from sqlalchemy.orm import Session

from app.db.models.user import User


def get_by_email(db: Session, *, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_by_username(db: Session, *, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()
