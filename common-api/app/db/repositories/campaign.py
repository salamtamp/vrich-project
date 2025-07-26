from datetime import UTC, datetime
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants.campaign import ERR_CAMPAIGN_POST_ID_NOT_FOUND
from app.db.models.campaign import Campaign
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.repositories.crud.base import CRUDBase
from app.db.repositories.facebook_post.repo import facebook_post_repo
from app.schemas.campaign import CampaignCreate, CampaignUpdate
from app.schemas.campaigns_products import CampaignProductCreate


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
                raise ValueError("A campaign with this name already exists.") from e
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

    def create_campaign_with_products(self, db: Session, campaign_in):
        try:
            campaign_data = {
                k: v for k, v in campaign_in.model_dump().items() if k != "products"
            }
            campaign = self.create(db, obj_in=CampaignCreate(**campaign_data))
            for prod in campaign_in.products:
                prod_data = prod.model_dump()
                # Validate status
                if prod_data.get("status") not in ("active", "inactive"):
                    raise ValueError(
                        f"Invalid product status: {prod_data.get('status')}"
                    )
                prod_data["campaign_id"] = campaign.id
                try:
                    campaign_product_repo.create(
                        db, obj_in=CampaignProductCreate(**prod_data)
                    )
                except Exception as prod_err:
                    print(
                        f"Failed to create campaign product: {prod_data}, "
                        f"error: {prod_err}"
                    )
                    raise prod_err from prod_err
            db.commit()
            db.refresh(campaign)
            return campaign
        except Exception as e:
            db.rollback()
            print(f"Failed to create campaign with products: {e}")
            raise e from e

    def update_campaign_with_products(self, db: Session, campaign_id, campaign_in):
        from app.db.models.campaigns_products import CampaignProduct
        from app.schemas.campaigns_products import CampaignProductCreate, CampaignProductUpdate

        try:
            # Get campaign
            campaign = (
                db.query(Campaign)
                .filter(Campaign.id == campaign_id, Campaign.deleted_at.is_(None))
                .first()
            )
            if not campaign:
                raise ValueError("Campaign not found")
            
            # Update campaign fields
            campaign_data = campaign_in.model_dump(exclude_unset=True)
            
            for field, value in campaign_data.items():
                if field != "products" and value is not None:
                    setattr(campaign, field, value)
            
            channels = (
                campaign_in.channels if hasattr(campaign_in, "channels") else None
            )
            if channels is not None and "facebook_comment" not in channels:
                campaign.post_id = None
            
            if campaign_in.products is not None:
                existing_products = (
                    db.query(CampaignProduct)
                    .filter(CampaignProduct.campaign_id == campaign_id)
                    .all()
                )
                existing_products_map = {
                    str(p.product_id): p for p in existing_products
                }

                for prod in campaign_in.products:
                    prod_data = prod.model_dump()
                    
                    if prod_data.get("status") not in ("active", "inactive"):
                        raise ValueError(
                            f"Invalid product status: {prod_data.get('status')}"
                        )
                    prod_data["campaign_id"] = campaign_id
                    product_id_str = str(prod.product_id)
                    
                    if product_id_str in existing_products_map:
                        db_obj = existing_products_map[product_id_str]
                        
                        db_obj.keyword = prod_data.get("keyword")
                        db_obj.quantity = prod_data.get("quantity")
                        db_obj.status = prod_data.get("status")
                        db_obj.max_order_quantity = prod_data.get("max_order_quantity", None)
                        db_obj.updated_at = datetime.now(UTC)
                        
                        db.add(db_obj)
                    else:
                        create_data = CampaignProductCreate(
                            campaign_id=campaign_id,
                            product_id=prod.product_id,
                            keyword=prod_data.get("keyword"),
                            quantity=prod_data.get("quantity"),
                            status=prod_data.get("status"),
                            max_order_quantity=prod_data.get("max_order_quantity", None),
                        )
                        campaign_product_repo.create(
                            db, obj_in=create_data
                        )
                
                incoming_product_ids = {str(p.product_id) for p in campaign_in.products}
                for product_id_str, db_obj in existing_products_map.items():
                    if product_id_str not in incoming_product_ids:
                        db.delete(db_obj)
            
            db.commit()
            db.refresh(campaign)
            return campaign
        except Exception as e:
            db.rollback()
            raise e from e


campaign_repo = CampaignRepo(Campaign)
