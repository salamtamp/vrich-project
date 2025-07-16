from app.db.models.campaign import Campaign
from app.db.repositories.crud.base import CRUDBase
from app.schemas.campaign import CampaignCreate, CampaignUpdate

campaign_repo = CRUDBase[Campaign, CampaignCreate, CampaignUpdate](Campaign)
