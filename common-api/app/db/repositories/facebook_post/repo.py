from app.db.models.facebook_post import FacebookPost
from app.db.repositories.crud.base import CRUDBase
from app.schemas.facebook_post import FacebookPostCreate, FacebookPostUpdate

from .create import create_facebook_post
from .query import get_by_post_id
from .update import update_facebook_post_data


class FacebookPostRepo(CRUDBase[FacebookPost, FacebookPostCreate, FacebookPostUpdate]):
    def get_by_post_id(self, db, post_id):
        return get_by_post_id(db, post_id=post_id)

    def create(self, db, obj_in):
        return create_facebook_post(db, obj_in=obj_in)

    def update(self, db, db_obj, obj_in):
        update_data = update_facebook_post_data(obj_in)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


facebook_post_repo = FacebookPostRepo(FacebookPost)
