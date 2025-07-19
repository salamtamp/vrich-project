from datetime import datetime
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.campaigns_notifications import CampaignNotification
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.campaigns_notifications.repo import campaign_notification_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.campaigns_notifications import (
    CampaignNotificationCreate,
    CampaignNotificationUpdate,
)
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate


def create_facebook_profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)


def create_campaign(db):
    campaign_in = CampaignCreate(
        name=f"Campaign {uuid4()}",
        description="Test campaign",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow(),
        status="active",
    )
    return campaign_repo.create(db, obj_in=campaign_in)


def create_order(db, profile_id, campaign_id):
    order_in = OrderCreate(
        code=f"ORD-{uuid4()}",
        profile_id=profile_id,
        campaign_id=campaign_id,
        status="pending",
        purchase_date=datetime.utcnow(),
    )
    return order_repo.create(db, obj_in=order_in)


@pytest.fixture
def campaign_notification_data(db):
    profile = create_facebook_profile(db)
    campaign = create_campaign(db)
    order = create_order(db, profile.id, campaign.id)
    return {
        "campaign_id": campaign.id,
        "profile_id": profile.id,
        "order_id": order.id,
        "message": {"text": "Test notification"},
        "status": "sent",
    }


def test_create_campaign_notification(db, campaign_notification_data):
    notification = campaign_notification_repo.create(
        db, CampaignNotificationCreate(**campaign_notification_data)
    )
    assert notification.status == campaign_notification_data["status"]
    assert notification.id is not None


def test_get_campaign_notification(db, campaign_notification_data):
    created = campaign_notification_repo.create(
        db, CampaignNotificationCreate(**campaign_notification_data)
    )
    found = (
        db.query(CampaignNotification)
        .filter(CampaignNotification.id == created.id)
        .first()
    )
    assert found is not None
    assert found.id == created.id


def test_update_campaign_notification(db, campaign_notification_data):
    created = campaign_notification_repo.create(
        db, CampaignNotificationCreate(**campaign_notification_data)
    )
    update_data = CampaignNotificationUpdate(status="read")
    updated = campaign_notification_repo.update(db, created, update_data)
    assert updated.status == "read"


def test_delete_campaign_notification(db, campaign_notification_data):
    created = campaign_notification_repo.create(
        db, CampaignNotificationCreate(**campaign_notification_data)
    )
    db.delete(created)
    db.commit()
    found = (
        db.query(CampaignNotification)
        .filter(CampaignNotification.id == created.id)
        .first()
    )
    assert found is None


def seed_campaign_notifications(db, count=5):
    profile = create_facebook_profile(db)
    campaign = create_campaign(db)
    order = create_order(db, profile.id, campaign.id)
    notifications = []
    for i in range(count):
        notification_in = CampaignNotificationCreate(
            campaign_id=campaign.id,
            profile_id=profile.id,
            order_id=order.id,
            message={"text": f"Notification {i}"},
            status="sent",
        )
        notification = campaign_notification_repo.create(db, obj_in=notification_in)
        notifications.append(notification)
    return notifications


def test_pagination_campaign_notifications(db):
    seed_campaign_notifications(db, count=10)
    builder = PaginationBuilder(CampaignNotification, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
