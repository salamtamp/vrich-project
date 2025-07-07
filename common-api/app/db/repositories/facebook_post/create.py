from sqlalchemy.orm import Session

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
    db.commit()
    db.refresh(db_obj)
    return db_obj
