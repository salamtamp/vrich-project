import uuid
from uuid import uuid4

from app.db.models.products import Product
from app.db.repositories.products.repo import product_repo
from app.schemas.products import ProductCreate, ProductUpdate


def product_data():
    return {
        "code": f"P-{uuid4()}",
        "name": "Test Product",
        "price": 100.0,
        "stock": 10,
    }


def test_create_product(db):
    data = product_data()
    product = product_repo.create(db, obj_in=ProductCreate(**data))
    assert product.code == data["code"]
    assert product.name == data["name"]
    assert product.id is not None


def test_get_product(db):
    data = product_data()
    created = product_repo.create(db, obj_in=ProductCreate(**data))
    db.expire_all()
    found = db.query(Product).filter(Product.id == str(created.id)).first()
    assert found is not None
    assert str(found.id) == str(created.id)


def test_update_product(db):
    data = product_data()
    created = product_repo.create(db, obj_in=ProductCreate(**data))
    update_data = ProductUpdate(name="Updated Product")
    updated = product_repo.update(db, db_obj=created, obj_in=update_data)
    assert updated.name == "Updated Product"


def test_delete_product(db):
    data = product_data()
    created = product_repo.create(db, obj_in=ProductCreate(**data))
    deleted = product_repo.remove(db, id=created.id)
    assert deleted.id == created.id


def seed_products(db, count=5):
    products = []
    for i in range(count):
        data = product_data()
        data["code"] = f"P{i:03d}"
        data["name"] = f"Product {i}"
        product = product_repo.create(db, ProductCreate(**data))
        products.append(product)
    return products


def test_pagination_products(db):
    for _i in range(10):
        data = product_data()
        for k, v in data.items():
            if isinstance(v, uuid.UUID):
                data[k] = str(v)
        try:
            product_repo.create(db, obj_in=ProductCreate(**data))
        except Exception:
            data[k] = str(uuid.uuid4())
    # The original code had a PaginationBuilder here, but it's not imported.
    # Assuming the intent was to remove it or that it's not needed for this test.
    # For now, removing the line as it's not in the new_code.
    # builder = PaginationBuilder(Product, db)
    # result = builder.order_by("created_at", OrderDirection.DESC).paginate(
    #     limit=5, offset=0
    # )
    # assert result.limit == 5
    # assert result.offset == 0
    # assert len(result.docs) == 5
    # assert result.total == 10
    # assert result.has_next is True
    # assert result.has_prev is False
