from sqlalchemy.orm import Session

from app.db.models.facebook_post import FacebookPost


def get_by_post_id(db: Session, *, post_id: str) -> FacebookPost | None:
    return db.query(FacebookPost).filter(FacebookPost.post_id == post_id).first()
