from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, subqueryload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.orders import Order as OrderModel
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.orders_products.repo import order_product_repo
from app.db.session import get_db
from app.schemas.orders import Order, OrderCreate, OrderUpdate

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Order])
def list_orders(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
    campaign_id: UUID | None = None,
) -> PaginationResponse[Order]:
    builder = PaginationBuilder(OrderModel, db)
    builder.query = builder.query.options(
        joinedload(OrderModel.profile),
        joinedload(OrderModel.orders_products),
    )
    builder = builder.filter_deleted()
    builder = builder.date_range(pagination.since, pagination.until)
    builder = builder.search(pagination.search, pagination.search_by)
    builder = builder.order_by(pagination.order_by, pagination.order)
    if campaign_id:
        builder = builder.custom_filter(campaign_id=campaign_id)
    print(
        "[DEBUG] SQL Query:",
        str(builder.query.statement.compile(compile_kwargs={"literal_binds": True})),
    )
    return builder.paginate(pagination.limit, pagination.offset, serializer=Order)


@router.get("/{order_id}", response_model=Order)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
) -> Order:
    order = (
        db.query(OrderModel)
        .options(
            joinedload(OrderModel.profile),
            subqueryload(OrderModel.orders_products).filter_by(deleted_at=None),
        )
        .filter(OrderModel.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(*, db: Session = Depends(get_db), order_in: OrderCreate) -> Order:
    # Create the order first (without products)
    order_products_data = order_in.orders_products
    order_data = order_in.model_copy(update={"orders_products": []})
    order = order_repo.create(db, obj_in=order_data)
    # Create related OrderProduct records
    for op in order_products_data:
        op_data = op.model_copy(update={"order_id": order.id})
        order_product_repo.create(db, obj_in=op_data)
    db.refresh(order)
    return order


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
