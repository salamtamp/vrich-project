from sqlalchemy.orm import Session

from app.constants.facebook_messenger import (
    ERR_FACEBOOK_INBOX_DUPLICATE_ID,
    ERR_FACEBOOK_INBOX_PROFILE_NOT_FOUND,
)
from app.db.models.facebook_inbox import FacebookInbox
from app.db.models.facebook_profile import FacebookProfile
from app.schemas.facebook_messenger import FacebookInboxCreate


def create_facebook_messenger(
    db: Session, *, obj_in: FacebookInboxCreate
) -> FacebookInbox:
    print(f"[DEBUG] create_facebook_messenger session id: {id(db)}")
    # Debug: Print all FacebookProfile IDs and the type/value being searched
    print("All FacebookProfile IDs:", [p.id for p in db.query(FacebookProfile).all()])
    print("Looking for profile_id:", obj_in.profile_id, type(obj_in.profile_id))
    # Check if profile exists
    profile = (
        db.query(FacebookProfile)
        .filter(FacebookProfile.id == str(obj_in.profile_id))
        .first()
    )
    if not profile:
        raise ValueError(ERR_FACEBOOK_INBOX_PROFILE_NOT_FOUND)

    # Check if messenger_id already exists
    existing_messenger = (
        db.query(FacebookInbox)
        .filter(FacebookInbox.messenger_id == obj_in.messenger_id)
        .first()
    )
    if existing_messenger:
        raise ValueError(ERR_FACEBOOK_INBOX_DUPLICATE_ID)

    db_obj = FacebookInbox(
        profile_id=obj_in.profile_id,
        messenger_id=obj_in.messenger_id,
        message=obj_in.message,
        type=obj_in.type,
        link=obj_in.link,
        published_at=obj_in.published_at,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
