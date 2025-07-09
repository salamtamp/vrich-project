from app.db.models.facebook_messenger import FacebookMessenger
from app.db.repositories.crud.base import CRUDBase
from app.schemas.facebook_messenger import (
    FacebookMessengerCreate,
    FacebookMessengerUpdate,
)

from .create import create_facebook_messenger
from .query import get_by_messenger_id


class FacebookMessengerRepo(
    CRUDBase[FacebookMessenger, FacebookMessengerCreate, FacebookMessengerUpdate]
):
    def get_by_messenger_id(self, db, messenger_id):
        return get_by_messenger_id(db, messenger_id=messenger_id)

    def create(self, db, obj_in):
        return create_facebook_messenger(db, obj_in=obj_in)

    def get_by_id(self, db, id):
        return db.query(FacebookMessenger).filter(FacebookMessenger.id == id).first()


facebook_messenger_repo = FacebookMessengerRepo(FacebookMessenger)
