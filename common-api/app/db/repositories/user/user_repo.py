from app.db.models.user import User
from app.db.repositories.crud.base import CRUDBase
from app.schemas.user import UserCreate, UserUpdate

from .user_auth import authenticate_user
from .user_create import create_user
from .user_query import get_by_email
from .user_update import update_user_data


class UserRepo(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db, email):
        return get_by_email(db, email=email)

    def authenticate(self, db, email, password):
        return authenticate_user(db, email=email, password=password)

    def create(self, db, obj_in):
        return create_user(db, obj_in=obj_in)

    def update(self, db, db_obj, obj_in):
        update_data = update_user_data(obj_in)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


user_repo = UserRepo(User)
