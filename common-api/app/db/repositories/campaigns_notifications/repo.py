from app.db.models.campaigns_notifications import CampaignNotification
from app.db.repositories.crud.base import CRUDBase
from app.schemas.campaigns_notifications import (
    CampaignNotificationCreate,
    CampaignNotificationUpdate,
)


class CampaignNotificationRepo(
    CRUDBase[
        CampaignNotification, CampaignNotificationCreate, CampaignNotificationUpdate
    ]
):
    pass


campaign_notification_repo = CampaignNotificationRepo(CampaignNotification)
