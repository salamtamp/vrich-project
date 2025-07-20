from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    campaign,
    campaigns_notifications,
    campaigns_products,
    facebook_comment,
    facebook_inbox,
    facebook_post,
    facebook_profile,
    notifications,
    orders,
    orders_products,
    payments,
    products,
    profiles_contacts,
    users,
    webhooks,
)

api_router = APIRouter()

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["users"],
)

api_router.include_router(
    facebook_profile.router,
    prefix="/facebook-profiles",
    tags=["facebook_profiles"],
)

api_router.include_router(
    facebook_post.router,
    prefix="/facebook-posts",
    tags=["facebook_posts"],
)

api_router.include_router(
    facebook_comment.router,
    prefix="/facebook-comments",
    tags=["facebook_comments"],
)

api_router.include_router(
    facebook_inbox.router,
    prefix="/facebook-inboxes",
    tags=["facebook_inboxes"],
)

api_router.include_router(
    campaign.router,
    prefix="/campaigns",
    tags=["campaigns"],
)

api_router.include_router(
    campaigns_notifications.router,
    prefix="/campaigns-notifications",
    tags=["campaigns_notifications"],
)

api_router.include_router(
    campaigns_products.router,
    prefix="/campaigns-products",
    tags=["campaigns_products"],
)

api_router.include_router(
    products.router,
    prefix="/products",
    tags=["products"],
)

api_router.include_router(
    orders.router,
    prefix="/orders",
    tags=["orders"],
)

api_router.include_router(
    orders_products.router,
    prefix="/orders-products",
    tags=["orders_products"],
)

api_router.include_router(
    payments.router,
    prefix="/payments",
    tags=["payments"],
)

api_router.include_router(
    profiles_contacts.router,
    prefix="/profiles-contacts",
    tags=["profiles_contacts"],
)

api_router.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["webhooks"],
)

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["notifications"],
)
