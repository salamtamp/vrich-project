from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.campaigns_products import CampaignProduct
from app.db.models.facebook_profile import FacebookProfile
from app.db.models.orders import Order as OrderModel
from app.db.models.orders_products import OrderProduct
from app.db.repositories.orders.repo import order_repo
from app.db.repositories.orders_products.repo import order_product_repo
from app.db.session import get_db
from app.schemas.orders import (
    BatchOrderStatusUpdateRequest,
    Order,
    OrderCreate,
    OrderUpdate,
)
from app.services import facebook_scheduler

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Order])
def list_orders(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
    campaign_id: UUID | None = None,
) -> PaginationResponse[Order]:
    builder = PaginationBuilder(OrderModel, db)
    builder.query = builder.query.options(
        joinedload(OrderModel.profile).joinedload(FacebookProfile.profiles_contacts),
        joinedload(OrderModel.orders_products)
        .joinedload(OrderProduct.campaign_product)
        .joinedload(CampaignProduct.product),
    )
    builder = builder.filter_deleted()
    builder = builder.date_range(pagination.since, pagination.until)
    builder = builder.search(pagination.search, pagination.search_by)
    builder = builder.order_by(pagination.order_by, pagination.order)
    if campaign_id:
        builder = builder.custom_filter(campaign_id=campaign_id)
    page = builder.paginate(pagination.limit, pagination.offset, serializer=Order)
    for order in page.docs:
        profile_contacts = (
            order.profile.profiles_contacts
            if order.profile and hasattr(order.profile, "profiles_contacts")
            else []
        )
        latest_contact = None
        if profile_contacts:
            not_deleted = [c for c in profile_contacts if c.deleted_at is None]
            if not_deleted:
                latest_contact = max(not_deleted, key=lambda c: c.created_at)
        order.profile_contact = latest_contact
    return page


@router.get("/{order_id}", response_model=Order)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
) -> Order:
    order = (
        db.query(OrderModel)
        .options(
            joinedload(OrderModel.profile).joinedload(
                FacebookProfile.profiles_contacts
            ),
            joinedload(OrderModel.orders_products)
            .joinedload(OrderProduct.campaign_product)
            .joinedload(CampaignProduct.product),
        )
        .filter(OrderModel.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    # Attach latest (not deleted) profile_contact
    profile_contacts = (
        order.profile.profiles_contacts
        if order.profile and hasattr(order.profile, "profiles_contacts")
        else []
    )
    latest_contact = None
    if profile_contacts:
        not_deleted = [c for c in profile_contacts if c.deleted_at is None]
        if not_deleted:
            latest_contact = max(not_deleted, key=lambda c: c.created_at)
    order.profile_contact = latest_contact
    return order


@router.post("/", response_model=Order, status_code=status.HTTP_201_CREATED)
def create_order(*, db: Session = Depends(get_db), order_in: OrderCreate) -> Order:
    order_products_data = order_in.orders_products
    order_data = order_in.model_copy(update={"orders_products": []})
    order = order_repo.create(db, obj_in=order_data)
    for op in order_products_data:
        op_data = op.model_copy(update={"order_id": order.id})
        order_product_repo.create(db, obj_in=op_data)
    db.refresh(order)
    return order


@router.put("/batch-update-status", response_model=list[Order])
def batch_update_order_status(
    request: BatchOrderStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    updated_orders = []
    for order_id in request.ids:
        db_obj = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if db_obj:
            prev_status = db_obj.status
            db_obj.status = request.status
            db.add(db_obj)
            updated_orders.append((db_obj, prev_status))
    db.commit()
    result_orders = []
    for order, prev_status in updated_orders:
        db.refresh(order)

        if (
            order.status == "confirmed"
            and prev_status != "confirmed"
            and order.profile
            and getattr(order.profile, "facebook_id", None)
        ):
            facebook_scheduler.send_template_message(
                order.profile.facebook_id, str(order.id)
            )
        result_orders.append(order)
    return result_orders


@router.put("/{order_id}", response_model=Order)
def update_order(
    *, db: Session = Depends(get_db), order_id: UUID, order_in: OrderUpdate
) -> Order:
    db_obj = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    prev_status = db_obj.status
    updated_order = order_repo.update(db, db_obj=db_obj, obj_in=order_in)
    # Send template message if status changed to confirmed
    if (
        order_in.status == "confirmed"
        and prev_status != "confirmed"
        and updated_order.profile
        and getattr(updated_order.profile, "facebook_id", None)
    ):
        facebook_scheduler.send_template_message(
            updated_order.profile.facebook_id, str(updated_order.id)
        )
    return updated_order


@router.delete("/{order_id}", response_model=Order)
def delete_order(*, db: Session = Depends(get_db), order_id: UUID) -> Order:
    db_obj = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
