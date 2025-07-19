from app.db.models.campaigns_products import CampaignProduct
from app.db.repositories.crud.base import CRUDBase
from app.schemas.campaigns_products import CampaignProductCreate, CampaignProductUpdate


class CampaignProductRepo(
    CRUDBase[CampaignProduct, CampaignProductCreate, CampaignProductUpdate]
):
    pass


campaign_product_repo = CampaignProductRepo(CampaignProduct)
