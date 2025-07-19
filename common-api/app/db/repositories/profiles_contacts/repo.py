from app.db.models.profiles_contacts import ProfileContact
from app.db.repositories.crud.base import CRUDBase
from app.schemas.profiles_contacts import ProfileContactCreate, ProfileContactUpdate


class ProfileContactRepo(
    CRUDBase[ProfileContact, ProfileContactCreate, ProfileContactUpdate]
):
    pass


profile_contact_repo = ProfileContactRepo(ProfileContact)
