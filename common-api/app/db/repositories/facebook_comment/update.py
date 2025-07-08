from app.schemas.facebook_comment import FacebookCommentUpdate


def update_facebook_comment_data(
    obj_in: FacebookCommentUpdate | dict[str, object],
) -> dict[str, object]:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    return update_data
