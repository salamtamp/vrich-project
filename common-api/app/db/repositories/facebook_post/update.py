from typing import Any

from app.schemas.facebook_post import FacebookPostUpdate


def update_facebook_post_data(
    obj_in: FacebookPostUpdate | dict[str, Any],
) -> dict[str, Any]:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    return update_data
