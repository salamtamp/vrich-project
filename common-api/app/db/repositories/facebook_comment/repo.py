from app.db.models.facebook_comment import FacebookComment
from app.db.repositories.crud.base import CRUDBase
from app.schemas.facebook_comment import FacebookCommentCreate, FacebookCommentUpdate

from .create import create_facebook_comment
from .query import get_by_comment_id
from .update import update_facebook_comment_data


class FacebookCommentRepo(
    CRUDBase[FacebookComment, FacebookCommentCreate, FacebookCommentUpdate]
):
    def get_by_comment_id(self, db, comment_id):
        return get_by_comment_id(db, comment_id=comment_id)

    def create(self, db, obj_in):
        return create_facebook_comment(db, obj_in=obj_in)

    def update(self, db, db_obj, obj_in):
        update_data = update_facebook_comment_data(obj_in)
        return super().update(db, db_obj=db_obj, obj_in=update_data)


facebook_comment_repo = FacebookCommentRepo(FacebookComment)
