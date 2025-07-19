from datetime import datetime
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.campaigns_products import CampaignProduct
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.repositories.products.repo import product_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.campaigns_products import CampaignProductCreate, CampaignProductUpdate
from app.schemas.products import ProductCreate


def create_campaign(db):
    campaign_in = CampaignCreate(
        name=f"Campaign {uuid4()}",
        description="Test campaign",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow(),
        status="active",
    )
    return campaign_repo.create(db, obj_in=campaign_in)


def create_product(db):
    product_in = ProductCreate(
        code=f"P{uuid4()}",
        name="Test Product",
        description="A product for testing.",
        quantity=10,
        unit="pcs",
        full_price=100.0,
        selling_price=80.0,
        cost=60.0,
        shipping_fee=10.0,
        note="Test note",
        keyword="test,product",
        product_category="CategoryA",
        product_type="TypeA",
        color="red",
        size="M",
        weight=1.5,
    )
    return product_repo.create(db, obj_in=product_in)


@pytest.fixture
def campaign_product_data(db):
    campaign = create_campaign(db)
    product = create_product(db)
    return {
        "campaign_id": campaign.id,
        "product_id": product.id,
        "keyword": "test-keyword",
        "quantity": 10,
        "max_order_quantity": 5,
        "status": "active",
    }


def test_create_campaign_product(db, campaign_product_data):
    campaign_product = campaign_product_repo.create(
        db, CampaignProductCreate(**campaign_product_data)
    )
    assert campaign_product.quantity == campaign_product_data["quantity"]
    assert campaign_product.id is not None


def test_get_campaign_product(db, campaign_product_data):
    created = campaign_product_repo.create(
        db, CampaignProductCreate(**campaign_product_data)
    )
    found = db.query(CampaignProduct).filter(CampaignProduct.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_campaign_product(db, campaign_product_data):
    created = campaign_product_repo.create(
        db, CampaignProductCreate(**campaign_product_data)
    )
    update_data = CampaignProductUpdate(quantity=20)
    updated = campaign_product_repo.update(db, created, update_data)
    assert updated.quantity == 20


def test_delete_campaign_product(db, campaign_product_data):
    created = campaign_product_repo.create(
        db, CampaignProductCreate(**campaign_product_data)
    )
    db.delete(created)
    db.commit()
    found = db.query(CampaignProduct).filter(CampaignProduct.id == created.id).first()
    assert found is None


def seed_campaign_products(db, count=5):
    campaign = create_campaign(db)
    product = create_product(db)
    campaign_products = []
    for i in range(count):
        campaign_product_in = CampaignProductCreate(
            campaign_id=campaign.id,
            product_id=product.id,
            keyword=f"keyword-{i}",
            quantity=i + 1,
            max_order_quantity=5,
            status="active",
        )
        campaign_product = campaign_product_repo.create(db, obj_in=campaign_product_in)
        campaign_products.append(campaign_product)
    return campaign_products


def test_pagination_campaign_products(db):
    seed_campaign_products(db, count=10)
    builder = PaginationBuilder(CampaignProduct, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
