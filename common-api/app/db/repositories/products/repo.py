from app.db.models.products import Product
from app.db.repositories.crud.base import CRUDBase
from app.schemas.products import ProductCreate, ProductUpdate


class ProductRepo(CRUDBase[Product, ProductCreate, ProductUpdate]):
    pass


product_repo = ProductRepo(Product)
