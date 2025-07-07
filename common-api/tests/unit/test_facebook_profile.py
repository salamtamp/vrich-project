import pytest

from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.schemas.facebook_profile import FacebookProfileCreate, FacebookProfileUpdate


@pytest.fixture
def facebook_profile_data():
    return {
        "facebook_id": "fb_123456",
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
