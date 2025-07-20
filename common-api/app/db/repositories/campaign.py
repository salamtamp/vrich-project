from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants.campaign import (
    ERR_CAMPAIGN_DUPLICATE_NAME,
    ERR_CAMPAIGN_POST_ID_NOT_FOUND,
)
from app.db.models.campaign import Campaign
from app.db.repositories.crud.base import CRUDBase
from app.db.repositories.facebook_post.repo import facebook_post_repo
from app.schemas.campaign import CampaignCreate, CampaignUpdate


class CampaignRepo(CRUDBase[Campaign, CampaignCreate, CampaignUpdate]):
    def create(self, db: Session, *, obj_in: CampaignCreate) -> Campaign:
        data = obj_in.model_dump(exclude_unset=False)
        channels = data.get("channels", [])
        post_id = data.get("post_id")
        if post_id is not None and "facebook_comment" not in channels:
            raise ValueError(
                "post_id can only be set if 'facebook_comment' is in channels."
            )
        if post_id is not None:
            facebook_post = facebook_post_repo.get_by_id(db, id=post_id)

            if not facebook_post:
                raise ValueError(ERR_CAMPAIGN_POST_ID_NOT_FOUND)
        try:
            return super().create(db, obj_in=obj_in)
        except IntegrityError as e:
            db.rollback()
            msg = str(e.orig)
            if (
                "UNIQUE constraint failed" in msg
                or "duplicate key value violates unique constraint" in msg
            ):
                raise ValueError(ERR_CAMPAIGN_DUPLICATE_NAME) from e
            if (
                "FOREIGN KEY constraint failed" in msg
                or "violates foreign key constraint" in msg
            ) and "post_id" in msg:
                raise ValueError(ERR_CAMPAIGN_POST_ID_NOT_FOUND) from e
            raise

    def update(
        self, db: Session, *, db_obj: Campaign, obj_in: CampaignUpdate | dict[str, Any]
    ) -> Campaign:
        if isinstance(obj_in, dict):
            channels = obj_in.get("channels")
            post_id = obj_in.get("post_id")
        else:
            channels = obj_in.channels
            post_id = obj_in.post_id
        if post_id is not None:
            if channels is not None:
                if "facebook_comment" not in channels:
                    raise ValueError(
                        "post_id can only be set if 'facebook_comment' is in channels."
                    )
            elif (
                db_obj.channels is not None
                and "facebook_comment" not in db_obj.channels
            ):
                raise ValueError(
                    "post_id can only be set if 'facebook_comment' is in channels."
                )
        if (
            channels is not None
            and "facebook_comment" not in channels
            and db_obj.post_id is not None
        ):
            obj_in = (
                obj_in.model_copy() if not isinstance(obj_in, dict) else dict(obj_in)
            )
            obj_in["post_id"] = None
        return super().update(db, db_obj=db_obj, obj_in=obj_in)


campaign_repo = CampaignRepo(Campaign)
