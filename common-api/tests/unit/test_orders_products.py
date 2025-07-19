from datetime import datetime
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.orders_products import OrderProduct
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.orders_products.repo import order_product_repo
from app.schemas.campaigns_products import CampaignProductCreate
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate
from app.schemas.orders_products import OrderProductCreate, OrderProductUpdate


def create_facebook_profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)


def create_order(db, profile_id):
    order_in = OrderCreate(
        code=f"ORD-{uuid4()}",
        profile_id=profile_id,
        campaign_id=uuid4(),
        status="pending",
        purchase_date=datetime.utcnow(),
    )
    return order_repo.create(db, obj_in=order_in)


def create_campaign_product(db):
    campaign_product_in = CampaignProductCreate(
        campaign_id=uuid4(),
        product_id=uuid4(),
        keyword="test",
        quantity=10,
        max_order_quantity=5,
        status="active",
    )
    return campaign_product_repo.create(db, obj_in=campaign_product_in)


@pytest.fixture
def order_product_data(db):
    profile = create_facebook_profile(db)
    order = create_order(db, profile.id)
    campaign_product = create_campaign_product(db)
    return {
        "order_id": order.id,
        "profile_id": profile.id,
        "campaign_product_id": campaign_product.id,
        "quantity": 2,
    }


def test_create_order_product(db, order_product_data):
    order_product = order_product_repo.create(
        db, OrderProductCreate(**order_product_data)
    )
    assert order_product.quantity == order_product_data["quantity"]
    assert order_product.id is not None


def test_get_order_product(db, order_product_data):
    created = order_product_repo.create(db, OrderProductCreate(**order_product_data))
    found = db.query(OrderProduct).filter(OrderProduct.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_order_product(db, order_product_data):
    created = order_product_repo.create(db, OrderProductCreate(**order_product_data))
    update_data = OrderProductUpdate(quantity=5)
    updated = order_product_repo.update(db, created, update_data)
    assert updated.quantity == 5


def test_delete_order_product(db, order_product_data):
    created = order_product_repo.create(db, OrderProductCreate(**order_product_data))
    db.delete(created)
    db.commit()
    found = db.query(OrderProduct).filter(OrderProduct.id == created.id).first()
    assert found is None


def seed_order_products(db, count=5):
    profile = create_facebook_profile(db)
    order = create_order(db, profile.id)
    campaign_product = create_campaign_product(db)
    order_products = []
    for i in range(count):
        order_product_in = OrderProductCreate(
            order_id=order.id,
            profile_id=profile.id,
            campaign_product_id=campaign_product.id,
            quantity=i + 1,
        )
        order_product = order_product_repo.create(db, obj_in=order_product_in)
        order_products.append(order_product)
    return order_products


def test_pagination_order_products(db):
    seed_order_products(db, count=10)
    builder = PaginationBuilder(OrderProduct, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
