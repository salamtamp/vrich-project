from sqlalchemy.orm import Session

from app.db.models.facebook_inbox import FacebookInbox
from app.db.repositories.crud.base import CRUDBase
from app.schemas.facebook_messenger import FacebookInboxCreate, FacebookInboxUpdate

from .create import create_facebook_messenger


class FacebookInboxRepo(
    CRUDBase[FacebookInbox, FacebookInboxCreate, FacebookInboxUpdate]
):
    def get_by_id(self, db: Session, *, id: str) -> FacebookInbox | None:
        return db.query(FacebookInbox).filter(FacebookInbox.id == id).first()

    def create(self, db: Session, obj_in: FacebookInboxCreate) -> FacebookInbox:
        return create_facebook_messenger(db, obj_in=obj_in)

    def get_by_messenger_id(
        self, db: Session, *, messenger_id: str
    ) -> FacebookInbox | None:
        return (
            db.query(FacebookInbox)
            .filter(FacebookInbox.messenger_id == messenger_id)
            .first()
        )


facebook_inbox_repo = FacebookInboxRepo(FacebookInbox)
