from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.schemas.facebook_profile import FacebookProfileCreate, FacebookProfileUpdate


@pytest.fixture
def facebook_profile_data():
    return {
        "facebook_id": f"fb_{uuid4()}",
        "type": "user",
        "name": "Test FB User",
        "profile_picture_url": "http://example.com/pic.jpg",
    }


def test_create_facebook_profile(db, facebook_profile_data):
    profile = facebook_profile_repo.create(
        db, FacebookProfileCreate(**facebook_profile_data)
    )
    assert profile.facebook_id == facebook_profile_data["facebook_id"]
    assert profile.type == facebook_profile_data["type"]
    assert profile.name == facebook_profile_data["name"]
    assert profile.profile_picture_url == facebook_profile_data["profile_picture_url"]
    assert profile.id is not None


def test_get_by_facebook_id(db, facebook_profile_data):
    created = facebook_profile_repo.create(
        db, FacebookProfileCreate(**facebook_profile_data)
    )
    found = facebook_profile_repo.get_by_facebook_id(
        db, facebook_id=facebook_profile_data["facebook_id"]
    )
    assert found is not None
    assert found.id == created.id


def test_update_facebook_profile(db, facebook_profile_data):
    created = facebook_profile_repo.create(
        db, FacebookProfileCreate(**facebook_profile_data)
    )
    update_data = FacebookProfileUpdate(name="Updated Name")
    updated = facebook_profile_repo.update(db, created, update_data)
    assert updated.name == "Updated Name"


def test_unique_facebook_profile(db, facebook_profile_data):
    facebook_profile_repo.create(db, FacebookProfileCreate(**facebook_profile_data))
    import sqlalchemy

    with pytest.raises(sqlalchemy.exc.IntegrityError):
        facebook_profile_repo.create(db, FacebookProfileCreate(**facebook_profile_data))


def seed_profiles(db, count=5):
    from app.db.repositories.facebook_profile.repo import facebook_profile_repo
    from app.schemas.facebook_profile import FacebookProfileCreate

    profiles = []
    for i in range(count):
        profile_in = FacebookProfileCreate(
            facebook_id=f"fbid-{i}-{uuid4()}",
            type="user",
            name=f"User {i}",
            profile_picture_url=f"http://example.com/pic{i}.jpg",
        )
        profile = facebook_profile_repo.create(db, obj_in=profile_in)
        profiles.append(profile)
    return profiles


def test_pagination_limit_offset(db):
    seed_profiles(db, count=10)
    builder = PaginationBuilder(FacebookProfile, db)
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


def test_pagination_ordering(db):
    seed_profiles(db, count=3)
    builder = PaginationBuilder(FacebookProfile, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(limit=3)
    created_ats = [doc["created_at"] for doc in result.docs]
    assert created_ats == sorted(created_ats, reverse=True)

    result2 = builder.order_by("created_at", OrderDirection.ASC).paginate(limit=3)
    created_ats_asc = [doc["created_at"] for doc in result2.docs]
    assert created_ats_asc == sorted(created_ats_asc)


def test_pagination_search(db):
    seed_profiles(db, count=5)
    from app.db.repositories.facebook_profile.repo import facebook_profile_repo
    from app.schemas.facebook_profile import FacebookProfileCreate

    unique_name = "SpecialSearchUser"
    profile_in = FacebookProfileCreate(
        facebook_id=f"fbid-special-{uuid4()}",
        type="user",
        name=unique_name,
        profile_picture_url="http://example.com/pic-special.jpg",
    )
    facebook_profile_repo.create(db, obj_in=profile_in)
    builder = PaginationBuilder(FacebookProfile, db)
    result = builder.search(search=unique_name, search_by="name").paginate()
    assert result.total >= 1
    assert any(unique_name in doc["name"] for doc in result.docs)
