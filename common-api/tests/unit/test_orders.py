from datetime import datetime
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.orders import Order
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate, OrderUpdate


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


@pytest.fixture
def order_data(db):
    profile = create_facebook_profile(db)
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


def test_create_order(db, order_data):
    order = order_repo.create(db, OrderCreate(**order_data))
    assert order.code == order_data["code"]
    assert order.status == order_data["status"]
    assert order.id is not None


def test_get_order(db, order_data):
    created = order_repo.create(db, OrderCreate(**order_data))
    found = db.query(Order).filter(Order.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_order(db, order_data):
    created = order_repo.create(db, OrderCreate(**order_data))
    update_data = OrderUpdate(status="shipped")
    updated = order_repo.update(db, created, update_data)
    assert updated.status == "shipped"


def test_delete_order(db, order_data):
    created = order_repo.create(db, OrderCreate(**order_data))
    db.delete(created)
    db.commit()
    found = db.query(Order).filter(Order.id == created.id).first()
    assert found is None


def seed_orders(db, count=5):
    profile = create_facebook_profile(db)
    campaign = create_campaign(db)
    orders = []
    for i in range(count):
        order_in = OrderCreate(
            code=f"ORD-{uuid4()}-{i}",
            profile_id=profile.id,
            campaign_id=campaign.id,
            status="pending",
            purchase_date=datetime.utcnow(),
        )
        order = order_repo.create(db, obj_in=order_in)
        orders.append(order)
    return orders


def test_pagination_orders(db):
    seed_orders(db, count=10)
    builder = PaginationBuilder(Order, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
