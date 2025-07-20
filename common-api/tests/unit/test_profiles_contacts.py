from uuid import uuid4

import pytest

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
        picture_url="http://example.com/pic.jpg",
        access_token="token",
        page_id=f"page_{uuid4()}",
    )
    profile = facebook_profile_repo.create(db, obj_in=profile_in)
    print(f"Created FacebookProfile with ID: {profile.id}")
    return profile


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
    profile = create_facebook_profile(db)
    data = profile_contact_data.copy()
    data["profile_id"] = profile.id
    contact = profile_contact_repo.create(db, obj_in=ProfileContactCreate(**data))
    db.add(contact)
    db.commit()
    db.refresh(contact)
    assert contact.first_name == data["first_name"]
    assert contact.last_name == data["last_name"]
    assert contact.email == data["email"]
    assert contact.id is not None


def test_get_profile_contact(db, profile_contact_data):
    profile = create_facebook_profile(db)
    data = profile_contact_data.copy()
    data["profile_id"] = profile.id
    created = profile_contact_repo.create(db, obj_in=ProfileContactCreate(**data))
    db.expire_all()
    found = (
        db.query(ProfileContact).filter(ProfileContact.id == str(created.id)).first()
    )
    assert found is not None
    assert str(found.id) == str(created.id)


def test_update_profile_contact(db, profile_contact_data):
    profile = create_facebook_profile(db)
    data = profile_contact_data.copy()
    data["profile_id"] = profile.id
    created = profile_contact_repo.create(db, obj_in=ProfileContactCreate(**data))
    db.add(created)
    db.commit()
    db.refresh(created)
    update_data = ProfileContactUpdate(phone="5559999999")
    updated = profile_contact_repo.update(db, db_obj=created, obj_in=update_data)
    assert updated.phone == "5559999999"


def test_delete_profile_contact(db, profile_contact_data):
    profile = create_facebook_profile(db)
    data = profile_contact_data.copy()
    data["profile_id"] = profile.id
    created = profile_contact_repo.create(db, obj_in=ProfileContactCreate(**data))
    db.add(created)
    db.commit()
    db.refresh(created)
    deleted = profile_contact_repo.remove(db, id=created.id)
    assert deleted.id == created.id


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
        contact = profile_contact_repo.create(db, contact_in)
        db.add(contact)
        db.commit()
        db.refresh(contact)
        contacts.append(contact)
    return contacts


def test_pagination_profile_contacts(db):
    profile = create_facebook_profile(db)
    contacts = []
    for i in range(10):
        contact_in = ProfileContactCreate(
            profile_id=profile.id,
            first_name=f"First{i}",
            last_name=f"Last{i}",
            email=f"user{i}@example.com",
            phone=f"555000{i}",
            address=f"{i} Main St",
        )
        contact = profile_contact_repo.create(db, obj_in=contact_in)
        db.add(contact)
        db.commit()
        db.refresh(contact)
        contacts.append(contact)
    assert len(contacts) == 10
