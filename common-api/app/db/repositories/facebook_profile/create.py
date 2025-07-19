from sqlalchemy.orm import Session

from app.db.models.facebook_profile import FacebookProfile
from app.schemas.facebook_profile import FacebookProfileCreate


def create_facebook_profile(
    db: Session, *, obj_in: FacebookProfileCreate
) -> FacebookProfile:
    db_obj = FacebookProfile(
        facebook_id=obj_in.facebook_id,
        type=obj_in.type,
        name=obj_in.name,
        profile_picture_url=obj_in.profile_picture_url,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
