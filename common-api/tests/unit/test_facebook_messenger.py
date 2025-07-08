from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.facebook_messenger import FacebookMessenger
from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.facebook_messenger.repo import facebook_messenger_repo
from app.schemas.facebook_messenger import (
    FacebookMessengerCreate,
    FacebookMessengerUpdate,
)


@pytest.fixture
def profile(db):
    profile = FacebookProfile(
        id=uuid4(),
        facebook_id="fbid-123",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    db.add(profile)
    db.commit()
    return profile


def test_create_facebook_messenger(db, profile):
    messenger_in = FacebookMessengerCreate(
        profile_id=profile.id,
        messenger_id="msg-1",
        message="Hello!",
        sent_at=datetime.now(UTC),
    )
    messenger = facebook_messenger_repo.create(db, obj_in=messenger_in)
    assert isinstance(messenger, FacebookMessenger)
    assert messenger.profile_id == profile.id
    assert messenger.messenger_id == "msg-1"
    assert messenger.message == "Hello!"


def test_unique_messenger_id(db, profile):
    messenger_in1 = FacebookMessengerCreate(
        profile_id=profile.id,
        messenger_id="msg-unique",
        message="First",
        sent_at=datetime.now(UTC),
    )
    facebook_messenger_repo.create(db, obj_in=messenger_in1)
    messenger_in2 = FacebookMessengerCreate(
        profile_id=profile.id,
        messenger_id="msg-unique",
        message="Second",
        sent_at=datetime.now(UTC),
    )
    with pytest.raises(ValueError):
        facebook_messenger_repo.create(db, obj_in=messenger_in2)


def test_foreign_key_profile_id(db):
    messenger_in = FacebookMessengerCreate(
        profile_id=uuid4(),
        messenger_id="msg-fk",
        message="Should fail",
        sent_at=datetime.now(UTC),
    )
    with pytest.raises(ValueError):
        facebook_messenger_repo.create(db, obj_in=messenger_in)


def seed_messengers(db, profile, count=5):
    messengers = []
    for i in range(count):
        messenger_in = FacebookMessengerCreate(
            profile_id=profile.id,
            messenger_id=f"msg-{i}",
            message=f"Message {i}",
            sent_at=datetime.now(UTC) - timedelta(minutes=i),
        )
        messenger = facebook_messenger_repo.create(db, obj_in=messenger_in)
        messengers.append(messenger)
    return messengers


def test_pagination_limit_offset(db, profile):
    seed_messengers(db, profile, count=10)
    builder = PaginationBuilder(FacebookMessenger, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False

    # Test offset
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
    seed_messengers(db, profile, count=3)
    builder = PaginationBuilder(FacebookMessenger, db)
    # Default order is DESC by created_at
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(limit=3)
    created_ats = [doc["created_at"] for doc in result.docs]
    assert created_ats == sorted(created_ats, reverse=True)

    # ASC order
    result2 = builder.order_by("created_at", OrderDirection.ASC).paginate(limit=3)
    created_ats_asc = [doc["created_at"] for doc in result2.docs]
    assert created_ats_asc == sorted(created_ats_asc)


def test_pagination_search(db, profile):
    seed_messengers(db, profile, count=5)
    # Add a unique message
    unique_message = "SpecialSearchMessage"
    messenger_in = FacebookMessengerCreate(
        profile_id=profile.id,
        messenger_id="msg-special",
        message=unique_message,
        sent_at=datetime.now(UTC),
    )
    facebook_messenger_repo.create(db, obj_in=messenger_in)
    builder = PaginationBuilder(FacebookMessenger, db)
    result = builder.search(search=unique_message, search_by="message").paginate()
    assert result.total >= 1
    assert any(unique_message in doc["message"] for doc in result.docs)


@pytest.fixture
def facebook_messenger_data(profile):
    return {
        "profile_id": profile.id,
        "messenger_id": "msg_123456",
        "message": "Test Messenger Message",
        "sent_at": datetime.now(UTC),
    }


def test_create_facebook_messenger_repo(db, profile, facebook_messenger_data):
    messenger = facebook_messenger_repo.create(
        db, FacebookMessengerCreate(**facebook_messenger_data)
    )
    assert messenger.messenger_id == facebook_messenger_data["messenger_id"]
    assert messenger.profile_id == facebook_messenger_data["profile_id"]
    assert messenger.message == facebook_messenger_data["message"]
    assert messenger.id is not None


def test_get_by_messenger_id(db, profile, facebook_messenger_data):
    created = facebook_messenger_repo.create(
        db, FacebookMessengerCreate(**facebook_messenger_data)
    )
    found = facebook_messenger_repo.get_by_messenger_id(
        db, messenger_id=facebook_messenger_data["messenger_id"]
    )
    assert found is not None
    assert found.id == created.id


def test_update_facebook_messenger_repo(db, profile, facebook_messenger_data):
    created = facebook_messenger_repo.create(
        db, FacebookMessengerCreate(**facebook_messenger_data)
    )
    update_data = FacebookMessengerUpdate(message="Updated Message")
    updated = facebook_messenger_repo.update(db, db_obj=created, obj_in=update_data)
    assert updated.message == "Updated Message"


def test_unique_facebook_messenger(db, profile, facebook_messenger_data):
    facebook_messenger_repo.create(
        db, FacebookMessengerCreate(**facebook_messenger_data)
    )
    import sqlalchemy

    with pytest.raises((sqlalchemy.exc.IntegrityError, ValueError)):
        facebook_messenger_repo.create(
            db, FacebookMessengerCreate(**facebook_messenger_data)
        )
