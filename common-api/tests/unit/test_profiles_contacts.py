from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.profiles_contacts import ProfileContact
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.profiles_contacts.repo import profile_contact_repo
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.profiles_contacts import ProfileContactCreate, ProfileContactUpdate


def create_facebook_profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)


@pytest.fixture
def profile_contact_data(db):
    profile = create_facebook_profile(db)
    return {
        "profile_id": profile.id,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "1234567890",
        "address": "123 Main St",
        "postal_code": "12345",
        "city": "Testville",
        "country": "Testland",
        "note": "Test note",
    }


def test_create_profile_contact(db, profile_contact_data):
    contact = profile_contact_repo.create(
        db, ProfileContactCreate(**profile_contact_data)
    )
    assert contact.first_name == profile_contact_data["first_name"]
    assert contact.last_name == profile_contact_data["last_name"]
    assert contact.email == profile_contact_data["email"]
    assert contact.id is not None


def test_get_profile_contact(db, profile_contact_data):
    created = profile_contact_repo.create(
        db, ProfileContactCreate(**profile_contact_data)
    )
    found = db.query(ProfileContact).filter(ProfileContact.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_profile_contact(db, profile_contact_data):
    created = profile_contact_repo.create(
        db, ProfileContactCreate(**profile_contact_data)
    )
    update_data = ProfileContactUpdate(first_name="Jane")
    updated = profile_contact_repo.update(db, created, update_data)
    assert updated.first_name == "Jane"


def test_delete_profile_contact(db, profile_contact_data):
    created = profile_contact_repo.create(
        db, ProfileContactCreate(**profile_contact_data)
    )
    db.delete(created)
    db.commit()
    found = db.query(ProfileContact).filter(ProfileContact.id == created.id).first()
    assert found is None


def seed_profile_contacts(db, count=5):
    profile = create_facebook_profile(db)
    contacts = []
    for i in range(count):
        contact_in = ProfileContactCreate(
            profile_id=profile.id,
            first_name=f"First{i}",
            last_name=f"Last{i}",
            email=f"user{i}@example.com",
            phone=f"555000{i}",
            address=f"{i} Main St",
        )
        contact = profile_contact_repo.create(db, obj_in=contact_in)
        contacts.append(contact)
    return contacts


def test_pagination_profile_contacts(db):
    seed_profile_contacts(db, count=10)
    builder = PaginationBuilder(ProfileContact, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
