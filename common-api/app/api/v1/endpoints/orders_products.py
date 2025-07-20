from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.orders_products import OrderProduct as OrderProductModel
from app.db.repositories.orders_products.repo import order_product_repo
from app.db.session import get_db
from app.schemas.orders_products import (
    OrderProduct,
    OrderProductCreate,
    OrderProductUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[OrderProduct])
def list_order_products(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[OrderProduct]:
    builder = PaginationBuilder(OrderProductModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=OrderProduct)
    )


@router.get("/{order_product_id}", response_model=OrderProduct)
def get_order_product(
    order_product_id: UUID,
    db: Session = Depends(get_db),
) -> OrderProduct:
    order_product = (
        db.query(OrderProductModel)
        .filter(OrderProductModel.id == order_product_id)
        .first()
    )
    if not order_product:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    return order_product


@router.post("/", response_model=OrderProduct, status_code=status.HTTP_201_CREATED)
def create_order_product(
    *, db: Session = Depends(get_db), order_product_in: OrderProductCreate
) -> OrderProduct:
    return order_product_repo.create(db, obj_in=order_product_in)


@router.put("/{order_product_id}", response_model=OrderProduct)
def update_order_product(
    *,
    db: Session = Depends(get_db),
    order_product_id: UUID,
    order_product_in: OrderProductUpdate
) -> OrderProduct:
    db_obj = (
        db.query(OrderProductModel)
        .filter(OrderProductModel.id == order_product_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    return order_product_repo.update(db, db_obj=db_obj, obj_in=order_product_in)


@router.delete("/{order_product_id}", response_model=OrderProduct)
def delete_order_product(
    *, db: Session = Depends(get_db), order_product_id: UUID
) -> OrderProduct:
    db_obj = (
        db.query(OrderProductModel)
        .filter(OrderProductModel.id == order_product_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="OrderProduct not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
