from datetime import datetime
from uuid import uuid4

import pytest

from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.payments import Payment
from app.db.repositories.facebook_profile.repo import facebook_profile_repo
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.payments.repo import payment_repo
from app.schemas.facebook_profile import FacebookProfileCreate
from app.schemas.orders import OrderCreate
from app.schemas.payments import PaymentCreate, PaymentUpdate


def create_facebook_profile(db):
    profile_in = FacebookProfileCreate(
        facebook_id=f"fb_{uuid4()}",
        type="user",
        name="Test User",
        profile_picture_url="http://example.com/pic.jpg",
    )
    return facebook_profile_repo.create(db, obj_in=profile_in)


def create_order(db, profile_id):
    order_in = OrderCreate(
        code=f"ORD-{uuid4()}",
        profile_id=profile_id,
        campaign_id=uuid4(),
        status="pending",
        purchase_date=datetime.utcnow(),
    )
    return order_repo.create(db, obj_in=order_in)


@pytest.fixture
def payment_data(db):
    profile = create_facebook_profile(db)
    order = create_order(db, profile.id)
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


def test_create_payment(db, payment_data):
    payment = payment_repo.create(db, PaymentCreate(**payment_data))
    assert payment.payment_code == payment_data["payment_code"]
    assert payment.amount == payment_data["amount"]
    assert payment.id is not None


def test_get_payment(db, payment_data):
    created = payment_repo.create(db, PaymentCreate(**payment_data))
    found = db.query(Payment).filter(Payment.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_payment(db, payment_data):
    created = payment_repo.create(db, PaymentCreate(**payment_data))
    update_data = PaymentUpdate(status="refunded")
    updated = payment_repo.update(db, created, update_data)
    assert updated.status == "refunded"


def test_delete_payment(db, payment_data):
    created = payment_repo.create(db, PaymentCreate(**payment_data))
    db.delete(created)
    db.commit()
    found = db.query(Payment).filter(Payment.id == created.id).first()
    assert found is None


def seed_payments(db, count=5):
    profile = create_facebook_profile(db)
    order = create_order(db, profile.id)
    payments = []
    for i in range(count):
        payment_in = PaymentCreate(
            profile_id=profile.id,
            order_id=order.id,
            payment_code=f"PAY-{uuid4()}-{i}",
            payment_slip=None,
            payment_date=datetime.utcnow(),
            amount=100.0 + i,
            method="credit_card",
            status="paid",
            note=f"Payment {i}",
            refund_id=None,
        )
        payment = payment_repo.create(db, obj_in=payment_in)
        payments.append(payment)
    return payments


def test_pagination_payments(db):
    seed_payments(db, count=10)
    builder = PaginationBuilder(Payment, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
