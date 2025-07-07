from app.db.repositories.user import user_repo

from .facebook_post import *  # noqa: F403
from .facebook_profile import *  # noqa: F403

__all__ = ["user_repo"]
