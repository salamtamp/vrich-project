from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Any

class CampaignNotificationBase(BaseModel):
    campaign_id: UUID
    profile_id: UUID
    order_id: UUID
    message: dict[str, Any]
    status: str

class CampaignNotificationCreate(CampaignNotificationBase):
    pass

class CampaignNotificationUpdate(BaseModel):
    campaign_id: UUID | None = None
    profile_id: UUID | None = None
    order_id: UUID | None = None
    message: dict[str, Any] | None = None
    status: str | None = None
    deleted_at: datetime | None = None

class CampaignNotificationResponse(CampaignNotificationBase):
    id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class CampaignNotification(CampaignNotificationResponse):
    pass 