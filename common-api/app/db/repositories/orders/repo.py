from app.db.models.orders import Order
from app.db.repositories.crud.base import CRUDBase
from app.schemas.orders import OrderCreate, OrderUpdate


class OrderRepo(CRUDBase[Order, OrderCreate, OrderUpdate]):
    pass


order_repo = OrderRepo(Order)
