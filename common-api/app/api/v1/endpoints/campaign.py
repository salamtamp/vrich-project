from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.campaign import Campaign as CampaignModel
from app.db.models.campaigns_products import CampaignProduct
from app.db.models.facebook_post import FacebookPost
from app.db.models.orders import Order as OrderModel
from app.db.models.orders_products import OrderProduct as OrderProductModel
from app.db.repositories.campaign import campaign_repo
from app.db.session import get_db
from app.schemas.campaign import (
    Campaign,
    CampaignCreate,
    CampaignUpdate,
    CampaignWithProductsCreate,
    CampaignWithProductsUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Campaign])
def list_campaigns(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Campaign]:
    builder = PaginationBuilder(CampaignModel, db)
    builder.query = builder.query.options(
        joinedload(CampaignModel.post).joinedload(FacebookPost.profile),
        joinedload(CampaignModel.campaigns_products).joinedload(
            CampaignProduct.product
        ),
    )
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=Campaign)
    )


@router.get("/{campaign_id}", response_model=Campaign)
def get_campaign(
    campaign_id: UUID,
    db: Session = Depends(get_db),
) -> Campaign:
    campaign = (
        db.query(CampaignModel)
        .options(
            joinedload(CampaignModel.post).joinedload(FacebookPost.profile),
            joinedload(CampaignModel.campaigns_products).joinedload(
                CampaignProduct.product
            ),
        )
        .filter(CampaignModel.id == campaign_id, CampaignModel.deleted_at.is_(None))
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/", response_model=Campaign, status_code=status.HTTP_201_CREATED)
def create_campaign(
    *, db: Session = Depends(get_db), campaign_in: CampaignCreate
) -> Campaign:
    try:
        return campaign_repo.create(db, obj_in=campaign_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/{campaign_id}", response_model=Campaign)
def update_campaign(
    *, db: Session = Depends(get_db), campaign_id: UUID, campaign_in: CampaignUpdate
) -> Campaign:
    db_obj = (
        db.query(CampaignModel)
        .filter(CampaignModel.id == campaign_id, CampaignModel.deleted_at.is_(None))
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign_repo.update(db, db_obj=db_obj, obj_in=campaign_in)


@router.delete("/{campaign_id}", response_model=Campaign)
def delete_campaign(*, db: Session = Depends(get_db), campaign_id: UUID) -> Campaign:
    db_obj = (
        db.query(CampaignModel)
        .filter(CampaignModel.id == campaign_id, CampaignModel.deleted_at.is_(None))
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="Campaign not found")

    from datetime import datetime

    db_obj.deleted_at = datetime.utcnow()
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.post(
    "/with-products", response_model=Campaign, status_code=status.HTTP_201_CREATED
)
async def create_campaign_with_products(
    campaign_in: CampaignWithProductsCreate,
    db: Session = Depends(get_db),
):
    try:
        return campaign_repo.create_campaign_with_products(db, campaign_in)
    except HTTPException as e:
        raise e from e
    except ValueError as e:
        raise HTTPException(
            status_code=409, detail=str(e)
        ) from e  # Conflict (e.g., duplicate)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.put("/with-products/{campaign_id}", response_model=Campaign)
async def update_campaign_with_products(
    campaign_id: UUID,
    campaign_in: CampaignWithProductsUpdate,
    db: Session = Depends(get_db),
):
    try:
        return campaign_repo.update_campaign_with_products(db, campaign_id, campaign_in)
    except HTTPException as e:
        raise e from e
    except ValueError as e:
        raise HTTPException(
            status_code=409, detail=str(e)
        ) from e  # Conflict (e.g., duplicate or business logic error)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/{campaign_id}/summary")
def get_campaign_summary(
    campaign_id: UUID,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    """Get campaign summary with product statistics, orders, sales, and profits"""

    # Get campaign with products
    campaign = (
        db.query(CampaignModel)
        .options(
            joinedload(CampaignModel.campaigns_products).joinedload(
                CampaignProduct.product
            ),
        )
        .filter(CampaignModel.id == campaign_id, CampaignModel.deleted_at.is_(None))
        .first()
    )

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Get orders for this campaign
    orders = (
        db.query(OrderModel)
        .options(
            joinedload(OrderModel.orders_products)
            .joinedload(OrderProductModel.campaign_product)
            .joinedload(CampaignProduct.product),
        )
        .filter(OrderModel.campaign_id == campaign_id, OrderModel.deleted_at.is_(None))
        .all()
    )

    # Calculate summary statistics
    total_orders = len(orders)
    total_sales = 0
    total_cost = 0
    total_profit = 0

    # Product summary data with pagination
    product_summary = []

    for cp in campaign.campaigns_products:
        if not cp.product:
            continue

        # Calculate sold quantity for this product
        sold_quantity = 0
        product_sales = 0
        product_cost = 0
        product_profit = 0

        for order in orders:
            for op in order.orders_products:
                if op.campaign_product_id == cp.id:
                    sold_quantity += op.quantity
                    unit_price = cp.product.selling_price or 0
                    unit_cost = cp.product.cost or 0
                    product_sales += op.quantity * unit_price
                    product_cost += op.quantity * unit_cost
                    product_profit += op.quantity * (unit_price - unit_cost)

        product_summary.append(
            {
                "product_id": str(cp.product.id),
                "product_name": cp.product.name,
                "selling_price": float(cp.product.selling_price or 0),
                "selling_unit": cp.product.unit or "piece",
                "cost": float(cp.product.cost or 0),
                "profit": product_profit,
                "sold_quantity": sold_quantity,
                "total_sales": product_sales,
                "total_cost": product_cost,
            }
        )

        total_sales += product_sales
        total_cost += product_cost
        total_profit += product_profit

    # Apply pagination to product summary
    total_products = len(product_summary)
    start_idx = pagination.offset
    end_idx = start_idx + pagination.limit
    paginated_products = product_summary[start_idx:end_idx]

    # Order status breakdown
    order_status_count = {}
    for order in orders:
        status = order.status
        order_status_count[status] = order_status_count.get(status, 0) + 1

    return {
        "campaign": {
            "id": str(campaign.id),
            "name": campaign.name,
            "status": campaign.status,
        },
        "summary": {
            "total_orders": total_orders,
            "total_sales": total_sales,
            "total_cost": total_cost,
            "total_profit": total_profit,
            "order_status_breakdown": order_status_count,
        },
        "products": {
            "docs": paginated_products,
            "total": total_products,
            "limit": pagination.limit,
            "offset": pagination.offset,
        },
    }
