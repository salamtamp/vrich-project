from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants.facebook_post import ERR_FACEBOOK_POST_DUPLICATE_ID
from app.constants.facebook_profile import ERR_FACEBOOK_PROFILE_NOT_FOUND
from app.db.models.facebook_post import FacebookPost
from app.schemas.facebook_post import FacebookPostCreate


def create_facebook_post(db: Session, *, obj_in: FacebookPostCreate) -> FacebookPost:
    db_obj = FacebookPost(
        profile_id=obj_in.profile_id,
        post_id=obj_in.post_id,
        message=obj_in.message,
        link=obj_in.link,
        media_url=obj_in.media_url,
        media_type=obj_in.media_type,
        status=obj_in.status,
        published_at=obj_in.published_at,
    )
    db.add(db_obj)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        msg = str(e.orig)
        if (
            "UNIQUE constraint failed" in msg
            or "duplicate key value violates unique constraint" in msg
        ):
            raise ValueError(ERR_FACEBOOK_POST_DUPLICATE_ID) from e
        if (
            "FOREIGN KEY constraint failed" in msg
            or "violates foreign key constraint" in msg
        ):
            raise ValueError(ERR_FACEBOOK_PROFILE_NOT_FOUND) from e
        raise ValueError("Database integrity error: " + msg) from e
    db.refresh(db_obj)
    return db_obj
