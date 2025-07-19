from app.api.dependencies.pagination import OrderDirection, PaginationBuilder
from app.db.models.products import Product
from app.db.repositories.products.repo import product_repo
from app.schemas.products import ProductCreate, ProductUpdate


def product_data():
    return {
        "code": "P001",
        "name": "Test Product",
        "description": "A product for testing.",
        "quantity": 10,
        "unit": "pcs",
        "full_price": 100.0,
        "selling_price": 80.0,
        "cost": 60.0,
        "shipping_fee": 10.0,
        "note": "Test note",
        "keyword": "test,product",
        "product_category": "CategoryA",
        "product_type": "TypeA",
        "color": "red",
        "size": "M",
        "weight": 1.5,
    }


def test_create_product(db):
    data = product_data()
    product = product_repo.create(db, ProductCreate(**data))
    assert product.code == data["code"]
    assert product.name == data["name"]
    assert product.id is not None


def test_get_product(db):
    data = product_data()
    created = product_repo.create(db, ProductCreate(**data))
    found = db.query(Product).filter(Product.id == created.id).first()
    assert found is not None
    assert found.id == created.id


def test_update_product(db):
    data = product_data()
    created = product_repo.create(db, ProductCreate(**data))
    update_data = ProductUpdate(name="Updated Product")
    updated = product_repo.update(db, created, update_data)
    assert updated.name == "Updated Product"


def test_delete_product(db):
    data = product_data()
    created = product_repo.create(db, ProductCreate(**data))
    db.delete(created)
    db.commit()
    found = db.query(Product).filter(Product.id == created.id).first()
    assert found is None


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
    seed_products(db, count=10)
    builder = PaginationBuilder(Product, db)
    result = builder.order_by("created_at", OrderDirection.DESC).paginate(
        limit=5, offset=0
    )
    assert result.limit == 5
    assert result.offset == 0
    assert len(result.docs) == 5
    assert result.total == 10
    assert result.has_next is True
    assert result.has_prev is False
