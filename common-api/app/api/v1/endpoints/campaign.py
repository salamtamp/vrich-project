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
        joinedload(CampaignModel.campaigns_products).joinedload(CampaignProduct.product),
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
            joinedload(CampaignModel.campaigns_products).joinedload(CampaignProduct.product),
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
