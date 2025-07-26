from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.campaign import Campaign
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.products.repo import product_repo
from app.schemas.campaign import CampaignCreate, CampaignWithProductsUpdate
from app.schemas.campaigns_products import CampaignProductInput
from app.schemas.products import ProductCreate


def seed_campaigns(db, count=10):
    campaigns = []
    for i in range(count):
        campaign_in = CampaignCreate(
            name=f"Campaign {i}",
            description=f"Description for campaign {i}",
            status="active" if i % 2 == 0 else "inactive",
            start_date=datetime.utcnow() - timedelta(days=i),
            end_date=datetime.utcnow() + timedelta(days=i),
            channels=(
                ["facebook_comment", "facebook_inbox"]
                if i % 2 == 0
                else ["facebook_comment"]
            ),
        )
        campaign = campaign_repo.create(db, obj_in=campaign_in)
        campaigns.append(campaign)
    return campaigns


def create_product(db):
    product_in = ProductCreate(
        code=f"PROD{uuid4().hex[:8].upper()}",
        name=f"Product {uuid4()}",
        description=f"Test product description {uuid4()}",
        selling_price=100.0,
        cost=50.0,
        unit="piece",
        quantity=100,
    )
    return product_repo.create(db, obj_in=product_in)


def test_pagination_campaigns(db):
    seed_campaigns(db, count=10)
    builder = PaginationBuilder(Campaign, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False


def test_campaign_with_new_fields(db):
    """Test creating a campaign with all new fields"""
    campaign_in = CampaignCreate(
        name="Test Campaign with New Fields",
        description="This is a test campaign with description and channels",
        status="active",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=30),
        channels=["facebook_comment", "facebook_inbox"],
    )
    campaign = campaign_repo.create(db, obj_in=campaign_in)

    assert campaign.id is not None
    assert campaign.name == "Test Campaign with New Fields"
    assert (
        campaign.description == "This is a test campaign with description and channels"
    )
    assert campaign.status == "active"
    assert campaign.channels == ["facebook_comment", "facebook_inbox"]
    assert campaign.start_date is not None
    assert campaign.end_date is not None
    assert campaign.created_at is not None
    assert campaign.updated_at is not None
    assert campaign.deleted_at is None


def test_campaign_with_minimal_fields(db):
    """Test creating a campaign with minimal required fields"""
    campaign_in = CampaignCreate(
        name="Minimal Campaign",
        status="inactive",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow() + timedelta(days=1),
        channels=["facebook_comment"],
    )
    campaign = campaign_repo.create(db, obj_in=campaign_in)

    assert campaign.id is not None
    assert campaign.name == "Minimal Campaign"
    assert campaign.description is None
    assert campaign.status == "inactive"
    assert campaign.channels == ["facebook_comment"]
    assert campaign.start_date is not None
    assert campaign.end_date is not None


def test_update_campaign_with_products_status(db):
    """Test updating campaign with products and verify status updates correctly"""
    # Create products
    product1 = create_product(db)
    product2 = create_product(db)

    # Create campaign first
    campaign_in = CampaignCreate(
        name="Test Campaign",
        description="Test campaign description",
        status="active",
        start_date=datetime.now(UTC),
        end_date=datetime.now(UTC) + timedelta(days=1),
        channels=["facebook_inbox"],
    )
    campaign = campaign_repo.create(db, obj_in=campaign_in)

    # Create campaign products manually
    from app.db.repositories.campaigns_products.repo import campaign_product_repo
    from app.schemas.campaigns_products import CampaignProductCreate

    cp1 = campaign_product_repo.create(
        db,
        obj_in=CampaignProductCreate(
            campaign_id=campaign.id,
            product_id=product1.id,
            keyword="test1",
            quantity=10,
            status="inactive",
        ),
    )

    cp2 = campaign_product_repo.create(
        db,
        obj_in=CampaignProductCreate(
            campaign_id=campaign.id,
            product_id=product2.id,
            keyword="test2",
            quantity=20,
            status="inactive",
        ),
    )

    # Commit the transaction to ensure data is persisted
    db.commit()

    # Verify initial status
    assert cp1.status == "inactive"
    assert cp2.status == "inactive"

    # Update campaign with products - change status to active
    update_in = CampaignWithProductsUpdate(
        products=[
            CampaignProductInput(
                product_id=product1.id, keyword="test1", quantity=15, status="active"
            ),
            CampaignProductInput(
                product_id=product2.id, keyword="test2", quantity=25, status="active"
            ),
        ]
    )

    updated_campaign = campaign_repo.update_campaign_with_products(
        db, campaign.id, update_in
    )

    # Verify status was updated correctly
    assert len(updated_campaign.campaigns_products) == 2
    for cp in updated_campaign.campaigns_products:
        assert cp.status == "active"
        if str(cp.product_id) == str(product1.id):
            assert cp.quantity == 15
        elif str(cp.product_id) == str(product2.id):
            assert cp.quantity == 25
