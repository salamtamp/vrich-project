from sqlalchemy.orm import Session

from app.db.models.facebook_messenger import FacebookMessenger


def get_by_messenger_id(db: Session, *, messenger_id: str) -> FacebookMessenger | None:
    return (
        db.query(FacebookMessenger)
        .filter(FacebookMessenger.messenger_id == messenger_id)
        .first()
    )
