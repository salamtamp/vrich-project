from app.db.models.payments import Payment
from app.db.repositories.crud.base import CRUDBase
from app.schemas.payments import PaymentCreate, PaymentUpdate


class PaymentRepo(CRUDBase[Payment, PaymentCreate, PaymentUpdate]):
    pass


payment_repo = PaymentRepo(Payment)
