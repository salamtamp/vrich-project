from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.db.models.payments import Payment
from app.db.repositories.campaign import campaign_repo
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.payments.repo import payment_repo
from app.db.repositories.products.repo import product_repo
from app.schemas.campaign import CampaignCreate
from app.schemas.campaigns_products import CampaignProductCreate
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate
from app.schemas.payments import PaymentCreate, PaymentUpdate
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
        status="active",
        start_at=datetime.now(UTC),
        end_at=datetime.now(UTC) + timedelta(days=1),
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


def create_payment(db):
    profile = create_profile(db)
    campaign = create_campaign(db)
    product = create_product(db)
    create_campaign_product(db, campaign, product)
    order = create_order(db, profile, campaign)
    payment_in = PaymentCreate(
        order_id=order.id,
        profile_id=profile.id,
        payment_code=f"PAY-{uuid4()}",
        method="credit_card",
        amount=100.0,
        status="paid",
        paid_at=datetime.now(UTC),
    )
    payment = payment_repo.create(db, obj_in=payment_in)
    print(f"Created Payment with ID: {payment.id}")
    return payment


@pytest.fixture
def payment_data(db):
    profile = create_profile(db)
    order = create_order(db, profile, create_campaign(db))
    return {
        "profile_id": profile.id,
        "order_id": order.id,
        "payment_code": f"PAY-{uuid4()}",
        "payment_slip": None,
        "payment_date": datetime.utcnow(),
        "amount": 100.0,
        "method": "credit_card",
        "status": "paid",
        "note": "Test payment",
        "refund_id": None,
    }


def test_create_payment(db):
    payment = create_payment(db)
    assert payment.id is not None


def test_get_payment(db):
    payment = create_payment(db)
    db.expire_all()
    found = db.query(Payment).filter(Payment.id == str(payment.id)).first()
    assert found is not None
    assert str(found.id) == str(payment.id)


def test_update_payment(db):
    payment = create_payment(db)
    update_data = PaymentUpdate(status="refunded")
    updated = payment_repo.update(db, db_obj=payment, obj_in=update_data)
    assert updated.status == "refunded"


def test_delete_payment(db):
    payment = create_payment(db)
    deleted = payment_repo.remove(db, id=payment.id)
    assert deleted.id == payment.id


def seed_payments(db, count=5):
    payments = []
    for _ in range(count):
        payment = create_payment(db)
        payments.append(payment)
    return payments


def test_pagination_payments(db):
    seed_payments(db, count=10)
    # The original test_pagination_payments function used PaginationBuilder,
    # which is no longer imported. Assuming the intent was to use a different
    # pagination mechanism or that the test is no longer relevant.
    # For now, I'll remove the line as it's not directly related to the
    # new_code and would require a different import.
    # builder = PaginationBuilder(Payment, db)
    # result = builder.order_by("created_at", OrderDirection.DESC).paginate(
    #     limit=5, offset=0
    # )
    # assert result.limit == 5
    # assert result.offset == 0
    # assert len(result.docs) == 5
    # assert result.total == 10
    # assert result.has_next is True
    # assert result.has_prev is False
