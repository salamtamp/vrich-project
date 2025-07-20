from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.campaigns_products import CampaignProduct as CampaignProductModel
from app.db.repositories.campaigns_products.repo import campaign_product_repo
from app.db.session import get_db
from app.schemas.campaigns_products import (
    CampaignProduct,
    CampaignProductCreate,
    CampaignProductResponse,
    CampaignProductUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[CampaignProductResponse])
def list_campaign_products(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[CampaignProductResponse]:
    builder = PaginationBuilder(CampaignProductModel, db)
    builder.query = builder.query.options(
        joinedload(CampaignProductModel.campaign),
        joinedload(CampaignProductModel.product),
    )
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(
            pagination.limit,
            pagination.offset,
            serializer=CampaignProductResponse,
        )
    )


@router.get("/{campaign_product_id}", response_model=CampaignProduct)
def get_campaign_product(
    campaign_product_id: UUID,
    db: Session = Depends(get_db),
) -> CampaignProduct:
    campaign_product = (
        db.query(CampaignProductModel)
        .filter(CampaignProductModel.id == campaign_product_id)
        .first()
    )
    if not campaign_product:
        raise HTTPException(status_code=404, detail="CampaignProduct not found")
    return campaign_product


@router.post("/", response_model=CampaignProduct, status_code=status.HTTP_201_CREATED)
def create_campaign_product(
    *, db: Session = Depends(get_db), campaign_product_in: CampaignProductCreate
) -> CampaignProduct:
    return campaign_product_repo.create(db, obj_in=campaign_product_in)


@router.put("/{campaign_product_id}", response_model=CampaignProduct)
def update_campaign_product(
    *,
    db: Session = Depends(get_db),
    campaign_product_id: UUID,
    campaign_product_in: CampaignProductUpdate,
) -> CampaignProduct:
    db_obj = (
        db.query(CampaignProductModel)
        .filter(CampaignProductModel.id == campaign_product_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="CampaignProduct not found")
    return campaign_product_repo.update(db, db_obj=db_obj, obj_in=campaign_product_in)


@router.delete("/{campaign_product_id}", response_model=CampaignProduct)
def delete_campaign_product(
    *, db: Session = Depends(get_db), campaign_product_id: UUID
) -> CampaignProduct:
    db_obj = (
        db.query(CampaignProductModel)
        .filter(CampaignProductModel.id == campaign_product_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="CampaignProduct not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
