
from app.db.models.products import Product
from app.db.repositories.crud.base import CRUDBase
from app.schemas.products import ProductCreate, ProductUpdate


class ProductRepo(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def bulk_create(self, db, *, objs_in: list[ProductCreate]) -> list[Product]:
        """Create multiple products in a single transaction."""
        db_objs = []
        for obj_in in objs_in:
            obj_in_data = obj_in.model_dump(exclude_unset=False)
            db_obj = self.model(**obj_in_data)
            db_objs.append(db_obj)

        db.add_all(db_objs)
        db.commit()

        # Refresh all objects to get their IDs
        for db_obj in db_objs:
            db.refresh(db_obj)

        return db_objs


product_repo = ProductRepo(Product)
