from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.products import Product as ProductModel
from app.db.repositories.products.repo import product_repo
from app.db.session import get_db
from app.schemas.products import Product, ProductCreate, ProductUpdate

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Product])
def list_products(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Product]:
    builder = PaginationBuilder(ProductModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=Product)
    )


@router.get("/{product_id}", response_model=Product)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
) -> Product:
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    *, db: Session = Depends(get_db), product_in: ProductCreate
) -> Product:
    return product_repo.create(db, obj_in=product_in)


@router.put("/{product_id}", response_model=Product)
def update_product(
    *, db: Session = Depends(get_db), product_id: UUID, product_in: ProductUpdate
) -> Product:
    db_obj = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_repo.update(db, db_obj=db_obj, obj_in=product_in)


@router.delete("/{product_id}", response_model=Product)
def delete_product(*, db: Session = Depends(get_db), product_id: UUID) -> Product:
    db_obj = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
