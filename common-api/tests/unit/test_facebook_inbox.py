from uuid import uuid4

import pytest
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import PaginationBuilder
from app.db.models.facebook_inbox import FacebookInbox
from app.db.models.facebook_profile import FacebookProfile
from app.db.repositories.facebook_inbox.repo import facebook_inbox_repo
from app.schemas.facebook_messenger import FacebookInboxCreate, FacebookInboxUpdate


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


def test_create_facebook_inbox(db: Session, profile):
    """Test creating a facebook inbox."""
    inbox_in = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id",
        message="Test message",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    inbox = facebook_inbox_repo.create(db, obj_in=inbox_in)
    assert isinstance(inbox, FacebookInbox)
    assert inbox.messenger_id == "test_messenger_id"
    assert inbox.profile_id == profile.id


def test_create_multiple_facebook_inboxes(db: Session, profile):
    """Test creating multiple facebook inboxes."""
    inbox_in1 = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id_1",
        message="Test message 1",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    inbox_in2 = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id_2",
        message="Test message 2",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    facebook_inbox_repo.create(db, obj_in=inbox_in1)
    facebook_inbox_repo.create(db, obj_in=inbox_in2)
    inboxes = db.query(FacebookInbox).all()
    assert len(inboxes) == 2


def test_create_facebook_inbox_with_same_messenger_id(db: Session, profile):
    """Test creating facebook inbox with duplicate messenger_id."""
    inbox_in = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id",
        message="Test message",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    facebook_inbox_repo.create(db, obj_in=inbox_in)
    with pytest.raises(ValueError):
        facebook_inbox_repo.create(db, obj_in=inbox_in)


def test_get_facebook_inbox_by_id(db: Session, profile):
    """Test getting facebook inbox by id."""
    inbox_in = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id",
        message="Test message",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    created_inbox = facebook_inbox_repo.create(db, obj_in=inbox_in)
    retrieved_inbox = facebook_inbox_repo.get_by_id(
        db, id=created_inbox.id
    )  # Pass UUID directly
    assert retrieved_inbox is not None
    assert retrieved_inbox.id == created_inbox.id


def test_pagination_builder_with_facebook_inbox(db: Session, profile):
    """Test pagination builder with facebook inbox."""
    # Create test data
    for i in range(10):
        inbox_in = FacebookInboxCreate(
            profile_id=profile.id,
            messenger_id=f"test_messenger_id_{i}",
            message=f"Test message {i}",
            type="text",
            link=None,
            published_at=profile.created_at,
        )
        facebook_inbox_repo.create(db, obj_in=inbox_in)

    builder = PaginationBuilder(FacebookInbox, db)
    result = builder.query.limit(5).offset(0).all()
    assert len(result) == 5


def test_pagination_builder_with_facebook_inbox_filtered(db: Session, profile):
    """Test pagination builder with facebook inbox filtered by profile."""
    # Create test data
    for i in range(10):
        inbox_in = FacebookInboxCreate(
            profile_id=profile.id,
            messenger_id=f"test_messenger_id_{i}",
            message=f"Test message {i}",
            type="text",
            link=None,
            published_at=profile.created_at,
        )
        facebook_inbox_repo.create(db, obj_in=inbox_in)

    builder = PaginationBuilder(FacebookInbox, db)
    result = (
        builder.query.filter(FacebookInbox.profile_id == profile.id)
        .limit(5)
        .offset(0)
        .all()
    )
    assert len(result) == 5


def test_update_facebook_inbox(db: Session, profile):
    """Test updating facebook inbox."""
    inbox_in = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id",
        message="Test message",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    created_inbox = facebook_inbox_repo.create(db, obj_in=inbox_in)
    update_data = FacebookInboxUpdate(message="Updated Message")
    updated_inbox = facebook_inbox_repo.update(
        db, db_obj=created_inbox, obj_in=update_data
    )
    assert updated_inbox.message == "Updated Message"


def test_unique_facebook_inbox(db: Session, profile):
    """Test unique constraint on messenger_id."""
    inbox_in = FacebookInboxCreate(
        profile_id=profile.id,
        messenger_id="test_messenger_id",
        message="Test message",
        type="text",
        link=None,
        published_at=profile.created_at,
    )
    facebook_inbox_repo.create(db, obj_in=inbox_in)
    with pytest.raises(ValueError):
        facebook_inbox_repo.create(db, obj_in=inbox_in)


@pytest.fixture
def facebook_inbox_data(profile):
    return {
        "profile_id": profile.id,
        "messenger_id": "test_messenger_id",
        "message": "Test message",
        "type": "text",
        "link": None,
        "published_at": profile.created_at,
    }


def test_create_facebook_inbox_repo(db, profile, facebook_inbox_data):
    inbox = facebook_inbox_repo.create(db, FacebookInboxCreate(**facebook_inbox_data))
    assert inbox.messenger_id == facebook_inbox_data["messenger_id"]
    assert inbox.profile_id == facebook_inbox_data["profile_id"]
    assert inbox.message == facebook_inbox_data["message"]


def test_get_by_messenger_id(db, profile, facebook_inbox_data):
    created = facebook_inbox_repo.create(db, FacebookInboxCreate(**facebook_inbox_data))
    found = facebook_inbox_repo.get_by_id(db, id=created.id)  # Pass UUID directly
    assert found is not None
    assert found.messenger_id == facebook_inbox_data["messenger_id"]


def test_update_facebook_inbox_repo(db, profile, facebook_inbox_data):
    created = facebook_inbox_repo.create(db, FacebookInboxCreate(**facebook_inbox_data))
    update_data = FacebookInboxUpdate(message="Updated Message")
    updated = facebook_inbox_repo.update(db, db_obj=created, obj_in=update_data)
    assert updated.message == "Updated Message"
