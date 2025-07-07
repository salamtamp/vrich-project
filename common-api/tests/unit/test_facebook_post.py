from datetime import datetime
from uuid import uuid4

import pytest

from app.db.repositories.facebook_post.repo import facebook_post_repo
from app.schemas.facebook_post import FacebookPostCreate, FacebookPostUpdate


@pytest.fixture
def facebook_post_data():
    return {
        "profile_id": uuid4(),
        "post_id": "post_123456",
        "message": "Test post message",
        "link": "http://example.com/post",
        "media_url": "http://example.com/media.jpg",
        "media_type": "image",
        "status": "active",
        "published_at": datetime.utcnow(),
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
