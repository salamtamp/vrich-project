from app.db.repositories.user import user_repo

from .campaigns_notifications import *  # noqa: F403
from .campaigns_products import *  # noqa: F403
from .facebook_post import *  # noqa: F403
from .facebook_profile import *  # noqa: F403
from .orders import *  # noqa: F403
from .orders_products import *  # noqa: F403
from .payments import *  # noqa: F403
from .products import *  # noqa: F403
from .profiles_contacts import *  # noqa: F403

__all__ = [
    "campaign_notification_repo",
    "campaign_product_repo",
    "order_product_repo",
    "order_repo",
    "payment_repo",
    "product_repo",
    "profile_contact_repo",
    "user_repo",
]
