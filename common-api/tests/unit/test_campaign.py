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
            status="active" if i % 2 == 0 else "inactive",
            start_at=datetime.utcnow() - timedelta(days=i),
            end_at=datetime.utcnow() + timedelta(days=i),
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
