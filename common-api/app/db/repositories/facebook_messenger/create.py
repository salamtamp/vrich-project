from sqlalchemy.orm import Session

from app.constants.facebook_messenger import (
    ERR_FACEBOOK_MESSENGER_DUPLICATE_ID,
    ERR_FACEBOOK_MESSENGER_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_messenger import FacebookMessenger
from app.db.models.facebook_profile import FacebookProfile
from app.schemas.facebook_messenger import FacebookMessengerCreate


def create_facebook_messenger(
    db: Session, *, obj_in: FacebookMessengerCreate
) -> FacebookMessenger:
    # Check ForeignKey
    profile = (
        db.query(FacebookProfile)
        .filter(FacebookProfile.id == obj_in.profile_id)
        .first()
    )
    if not profile:
        raise ValueError(ERR_FACEBOOK_MESSENGER_PROFILE_NOT_FOUND)
    # Check uniqueness
    existing = (
        db.query(FacebookMessenger)
        .filter(FacebookMessenger.messenger_id == obj_in.messenger_id)
        .first()
    )
    if existing:
        raise ValueError(ERR_FACEBOOK_MESSENGER_DUPLICATE_ID)
    db_obj = FacebookMessenger(
        profile_id=obj_in.profile_id,
        messenger_id=obj_in.messenger_id,
        message=obj_in.message,
        sent_at=obj_in.sent_at,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
