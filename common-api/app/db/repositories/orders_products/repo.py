from app.db.models.orders_products import OrderProduct
from app.db.repositories.crud.base import CRUDBase
from app.schemas.orders_products import OrderProductCreate, OrderProductUpdate


class OrderProductRepo(CRUDBase[OrderProduct, OrderProductCreate, OrderProductUpdate]):
    pass


order_product_repo = OrderProductRepo(OrderProduct)
