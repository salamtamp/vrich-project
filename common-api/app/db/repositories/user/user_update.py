from app.core.security import get_password_hash
from app.schemas.user import UserUpdate


def update_user_data(obj_in: UserUpdate | dict[str, object]) -> dict[str, object]:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    if update_data.get("password"):
        password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["password"] = password
    return update_data
