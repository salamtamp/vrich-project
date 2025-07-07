from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.crud.base import CRUDBase
from app.schemas.facebook_profile import FacebookProfileCreate, FacebookProfileUpdate

from .create import create_facebook_profile
from .query import get_by_facebook_id
from .update import update_facebook_profile_data


class FacebookProfileRepo(
    CRUDBase[FacebookProfile, FacebookProfileCreate, FacebookProfileUpdate]
):
    def get_by_facebook_id(self, db, facebook_id):
        return get_by_facebook_id(db, facebook_id=facebook_id)

    def create(self, db, obj_in):
        return create_facebook_profile(db, obj_in=obj_in)

    def update(self, db, db_obj, obj_in):
        update_data = update_facebook_profile_data(obj_in)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


facebook_profile_repo = FacebookProfileRepo(FacebookProfile)
