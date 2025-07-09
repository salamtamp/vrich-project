from sqlalchemy.orm import Session

from app.db.models.facebook_inbox import FacebookInbox


def get_by_messenger_id(db: Session, *, messenger_id: str) -> FacebookInbox | None:
    return (
        db.query(FacebookInbox)
        .filter(FacebookInbox.messenger_id == messenger_id)
        .first()
    )
