from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants.facebook_comment import (
    ERR_FACEBOOK_COMMENT_DUPLICATE_ID,
    ERR_FACEBOOK_COMMENT_POST_NOT_FOUND,
    ERR_FACEBOOK_COMMENT_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_comment import FacebookComment
from app.schemas.facebook_comment import FacebookCommentCreate


def create_facebook_comment(
    db: Session, *, obj_in: FacebookCommentCreate
) -> FacebookComment:
    db_obj = FacebookComment(
        profile_id=obj_in.profile_id,
        post_id=obj_in.post_id,
        comment_id=obj_in.comment_id,
        message=obj_in.message,
        type=obj_in.type,
        link=obj_in.link,
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
            raise ValueError(ERR_FACEBOOK_COMMENT_DUPLICATE_ID) from e
        if (
            "FOREIGN KEY constraint failed" in msg
            or "violates foreign key constraint" in msg
        ):
            raise ValueError(ERR_FACEBOOK_COMMENT_PROFILE_NOT_FOUND) from e
        if "post_id" in msg:
            raise ValueError(ERR_FACEBOOK_COMMENT_POST_NOT_FOUND) from e
        raise ValueError("Database integrity error: " + msg) from e
    db.refresh(db_obj)
    return db_obj
