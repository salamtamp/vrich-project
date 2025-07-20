from datetime import UTC, datetime, timedelta
from uuid import uuid4

from app.db.models.orders_products import OrderProduct
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.orders_products.repo import order_product_repo
from app.db.repositories.products.repo import product_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.campaigns_products import CampaignProductCreate
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate
from app.schemas.orders_products import OrderProductCreate, OrderProductUpdate
from app.schemas.products import ProductCreate


def create_profile(db):
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


def create_campaign(db):
    campaign_in = CampaignCreate(
        name=f"Campaign {uuid4()}",
        description=f"Test campaign description {uuid4()}",
        status="active",
        start_date=datetime.now(UTC),
        end_date=datetime.now(UTC) + timedelta(days=1),
        channels=["facebook_comment", "facebook_inbox"],
    )
    campaign = campaign_repo.create(db, obj_in=campaign_in)
    print(f"Created Campaign with ID: {campaign.id}")
    return campaign


def create_product(db):
    product_in = ProductCreate(
        code=f"P-{uuid4()}",
        name="Test Product",
        price=100.0,
        stock=10,
    )
    product = product_repo.create(db, obj_in=product_in)
    print(f"Created Product with ID: {product.id}")
    return product


def create_campaign_product(db, campaign, product):
    campaign_product_in = CampaignProductCreate(
        campaign_id=campaign.id,
        product_id=product.id,
        keyword="test",
        quantity=10,
        max_order_quantity=5,
        status="active",
    )
    campaign_product = campaign_product_repo.create(db, obj_in=campaign_product_in)
    print(f"Created CampaignProduct with ID: {campaign_product.id}")
    return campaign_product


def create_order(db, profile, campaign):
    order_in = OrderCreate(
        code=f"ORD-{uuid4()}",
        profile_id=profile.id,
        campaign_id=campaign.id,
        status="pending",
        purchase_date=datetime.now(UTC),
    )
    order = order_repo.create(db, obj_in=order_in)
    print(f"Created Order with ID: {order.id}")
    return order


def create_order_product(db):
    profile = create_profile(db)
    campaign = create_campaign(db)
    product = create_product(db)
    campaign_product = create_campaign_product(db, campaign, product)
    order = create_order(db, profile, campaign)
    order_product_in = OrderProductCreate(
        order_id=order.id,
        campaign_product_id=campaign_product.id,
        profile_id=profile.id,
        quantity=2,
        price=100.0,
        status="active",
    )
    order_product = order_product_repo.create(db, obj_in=order_product_in)
    print(f"Created OrderProduct with ID: {order_product.id}")
    return order_product


def test_create_order_product(db):
    order_product = create_order_product(db)
    assert order_product.id is not None


def test_get_order_product(db):
    order_product = create_order_product(db)
    db.expire_all()
    found = (
        db.query(OrderProduct).filter(OrderProduct.id == str(order_product.id)).first()
    )
    assert found is not None
    assert str(found.id) == str(order_product.id)


def test_update_order_product(db):
    order_product = create_order_product(db)
    update_data = OrderProductUpdate(quantity=5)
    updated = order_product_repo.update(db, db_obj=order_product, obj_in=update_data)
    assert updated.quantity == 5


def test_delete_order_product(db):
    # Ensure the products table exists by creating a product and committing
    create_product(db)
    db.commit()
    order_product = create_order_product(db)
    db.delete(order_product)
    db.commit()
    found = (
        db.query(OrderProduct).filter(OrderProduct.id == str(order_product.id)).first()
    )
    assert found is None


def seed_order_products(db, count=5):
    order_products = []
    for _ in range(count):
        order_product = create_order_product(db)
        order_products.append(order_product)
    return order_products
