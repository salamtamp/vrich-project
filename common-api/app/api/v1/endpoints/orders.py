from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.orders import Order as OrderModel
from app.db.repositories.orders.repo import order_repo
from app.db.session import get_db
from app.schemas.orders import Order, OrderCreate, OrderUpdate

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Order])
def list_orders(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Order]:
    builder = PaginationBuilder(OrderModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=Order)
    )


@router.get("/{order_id}", response_model=Order)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
) -> Order:
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(*, db: Session = Depends(get_db), order_in: OrderCreate) -> Order:
    return order_repo.create(db, obj_in=order_in)


@router.put("/{order_id}", response_model=Order)
def update_order(
    *, db: Session = Depends(get_db), order_id: UUID, order_in: OrderUpdate
) -> Order:
    db_obj = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_repo.update(db, db_obj=db_obj, obj_in=order_in)


@router.delete("/{order_id}", response_model=Order)
def delete_order(*, db: Session = Depends(get_db), order_id: UUID) -> Order:
    db_obj = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
