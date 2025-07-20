from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.db.models.orders import Order
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate, OrderUpdate


def create_profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        picture_url="http://example.com/pic.jpg",
        access_token="token",
        page_id=f"page_{uuid4()}",
    )
    profile = facebook_profile_repo.create(db, obj_in=profile_in)
    print(f"Created FacebookProfile with ID: {profile.id}")
    return profile


def create_campaign(db):
    campaign_in = CampaignCreate(
        name=f"Campaign {uuid4()}",
        description=f"Test campaign description {uuid4()}",
        status="active",
        start_date=datetime.now(UTC),
        end_date=datetime.now(UTC) + timedelta(days=1),
        channels=["facebook_comment", "facebook_inbox"],
    )
    campaign = campaign_repo.create(db, obj_in=campaign_in)
    print(f"Created Campaign with ID: {campaign.id}")
    return campaign


def create_order(db):
    profile = create_profile(db)
    campaign = create_campaign(db)
    order_in = OrderCreate(
        code=f"ORD-{uuid4()}",
        profile_id=profile.id,
        campaign_id=campaign.id,
        status="pending",
        purchase_date=datetime.now(UTC),
    )
    order = order_repo.create(db, obj_in=order_in)
    print(f"Created Order with ID: {order.id}")
    return order


@pytest.fixture
def order_data(db):
    profile = create_profile(db)
    campaign = create_campaign(db)
    return {
        "code": f"ORD-{uuid4()}",
        "profile_id": profile.id,
        "campaign_id": campaign.id,
        "status": "pending",
        "purchase_date": datetime.utcnow(),
        "shipping_date": None,
        "delivery_date": None,
        "note": "Test order",
    }


def test_create_order(db):
    order = create_order(db)
    assert order.id is not None


def test_get_order(db):
    order = create_order(db)
    db.expire_all()
    found = db.query(Order).filter(Order.id == str(order.id)).first()
    assert found is not None
    assert str(found.id) == str(order.id)


def test_update_order(db):
    order = create_order(db)
    update_data = OrderUpdate(status="shipped")
    updated = order_repo.update(db, db_obj=order, obj_in=update_data)
    assert updated.status == "shipped"


def test_delete_order(db):
    order = create_order(db)
    deleted = order_repo.remove(db, id=order.id)
    assert deleted.id == order.id


def seed_orders(db, count=5):
    orders = []
    for _ in range(count):
        order = create_order(db)
        orders.append(order)
    return orders
