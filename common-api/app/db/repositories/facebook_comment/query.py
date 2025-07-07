from sqlalchemy.orm import Session

from app.db.models.facebook_comment import FacebookComment


def get_by_comment_id(db: Session, *, comment_id: str) -> FacebookComment | None:
    return (
        db.query(FacebookComment)
        .filter(FacebookComment.comment_id == comment_id)
        .first()
    )
