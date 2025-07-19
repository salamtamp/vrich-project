from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy.exc import IntegrityError

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.facebook_post import FacebookPost
from app.db.repositories.facebook_post.repo import facebook_post_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.schemas.facebook_post import FacebookPostCreate, FacebookPostUpdate
from app.schemas.facebook_profile import FacebookProfileCreate


@pytest.fixture
def profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fbid-{uuid4()}",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)


@pytest.fixture
def facebook_post_data(profile):
    return {
        "profile_id": profile.id,
        "post_id": "post_123456",
        "message": "Test post message",
        "link": "http://example.com/post",
        "media_url": "http://example.com/media.jpg",
        "media_type": "image",
        "status": "active",
        "published_at": datetime.now(UTC),
    }


def test_create_facebook_post(db, facebook_post_data):
    post = facebook_post_repo.create(db, FacebookPostCreate(**facebook_post_data))
    assert post.post_id == facebook_post_data["post_id"]
    assert post.status == facebook_post_data["status"]
    assert post.media_type == facebook_post_data["media_type"]
    assert post.id is not None


def test_get_by_post_id(db, facebook_post_data):
    created = facebook_post_repo.create(db, FacebookPostCreate(**facebook_post_data))
    found = facebook_post_repo.get_by_post_id(db, post_id=facebook_post_data["post_id"])
    assert found is not None
    assert found.id == created.id


def test_update_facebook_post(db, facebook_post_data):
    created = facebook_post_repo.create(db, FacebookPostCreate(**facebook_post_data))
    update_data = FacebookPostUpdate(message="Updated message")
    updated = facebook_post_repo.update(db, created, update_data)
    assert updated.message == "Updated message"


def test_unique_facebook_post(db, facebook_post_data):
    facebook_post_repo.create(db, FacebookPostCreate(**facebook_post_data))
    with pytest.raises(ValueError):
        facebook_post_repo.create(db, FacebookPostCreate(**facebook_post_data))


def test_foreign_key_profile_id_facebook_post(db, facebook_post_data):
    data = facebook_post_data.copy()

    data["profile_id"] = uuid4()
    with pytest.raises(ValueError):
        facebook_post_repo.create(db, FacebookPostCreate(**data))


def create(self, db, obj_in):
    obj = FacebookPost(**obj_in.dict())
    db.add(obj)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise ValueError("Database integrity error") from e
    db.refresh(obj)
    return obj


def seed_posts(db, profile, count=5):
    from datetime import UTC, datetime, timedelta

    from app.db.repositories.facebook_post.repo import facebook_post_repo
    from app.schemas.facebook_post import FacebookPostCreate

    posts = []
    for i in range(count):
        post_in = FacebookPostCreate(
            profile_id=profile.id,
            post_id=f"post-{i}",
            message=f"Message {i}",
            link=None,
            media_url=None,
            media_type=None,
            status="active",
            published_at=datetime.now(UTC) - timedelta(minutes=i),
        )
        post = facebook_post_repo.create(db, obj_in=post_in)
        posts.append(post)
    return posts


def test_pagination_limit_offset(db, profile):
    seed_posts(db, profile, count=10)
    builder = PaginationBuilder(FacebookPost, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False

    result2 = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=5
    )
    assert result2.limit == 5
    assert result2.offset == 5
    assert len(result2.docs) == 5
    assert result2.total == 10
    assert result2.has_next is False
    assert result2.has_prev is True


def test_pagination_ordering(db, profile):
    seed_posts(db, profile, count=3)
    builder = PaginationBuilder(FacebookPost, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(limit=3)
    created_ats = [doc["created_at"] for doc in result.docs]
    assert created_ats == sorted(created_ats, reverse=True)

    result2 = builder.order_by("created_at", OrderDirection.ASC).paginate(limit=3)
    created_ats_asc = [doc["created_at"] for doc in result2.docs]
    assert created_ats_asc == sorted(created_ats_asc)


def test_pagination_search(db, profile):
    seed_posts(db, profile, count=5)
    from datetime import UTC, datetime

    from app.db.repositories.facebook_post.repo import facebook_post_repo
    from app.schemas.facebook_post import FacebookPostCreate

    unique_message = "SpecialSearchMessage"
    post_in = FacebookPostCreate(
        profile_id=profile.id,
        post_id="post-special",
        message=unique_message,
        link=None,
        media_url=None,
        media_type=None,
        status="active",
        published_at=datetime.now(UTC),
    )
    facebook_post_repo.create(db, obj_in=post_in)
    builder = PaginationBuilder(FacebookPost, db)
    result = builder.search(search=unique_message, search_by="message").paginate()
    assert result.total >= 1
    assert any(unique_message in doc["message"] for doc in result.docs)
