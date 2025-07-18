from app.schemas.facebook_profile import FacebookProfileUpdate


def update_facebook_profile_data(
    obj_in: FacebookProfileUpdate | dict[str, object],
) -> dict[str, object]:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    return update_data
