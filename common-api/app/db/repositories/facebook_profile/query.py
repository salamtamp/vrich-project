from sqlalchemy.orm import Session

from app.db.models.facebook_profile import FacebookProfile


def get_by_facebook_id(
    db: Session, *, facebook_id: str
) -> FacebookProfile | None:
    return (
        db.query(FacebookProfile)
        .filter(FacebookProfile.facebook_id == facebook_id)
        .first()
    )
