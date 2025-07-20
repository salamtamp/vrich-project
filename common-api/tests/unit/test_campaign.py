from datetime import datetime, timedelta

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.campaign import Campaign
from app.db.repositories.campaign import campaign_repo
from app.schemas.campaign import CampaignCreate


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
