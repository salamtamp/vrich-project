from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.campaign import Campaign as CampaignModel
from app.db.repositories.campaign import campaign_repo
from app.db.session import get_db
from app.schemas.campaign import Campaign, CampaignCreate, CampaignUpdate

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Campaign])
def list_campaigns(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Campaign]:
    builder = PaginationBuilder(CampaignModel, db)
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
    campaign = db.query(CampaignModel).filter(CampaignModel.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.post("/", response_model=Campaign, status_code=status.HTTP_201_CREATED)
def create_campaign(
    *, db: Session = Depends(get_db), campaign_in: CampaignCreate
) -> Campaign:
    return campaign_repo.create(db, obj_in=campaign_in)


@router.put("/{campaign_id}", response_model=Campaign)
def update_campaign(
    *, db: Session = Depends(get_db), campaign_id: UUID, campaign_in: CampaignUpdate
) -> Campaign:
    db_obj = db.query(CampaignModel).filter(CampaignModel.id == campaign_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign_repo.update(db, db_obj=db_obj, obj_in=campaign_in)


@router.delete("/{campaign_id}", response_model=Campaign)
def delete_campaign(*, db: Session = Depends(get_db), campaign_id: UUID) -> Campaign:
    db_obj = db.query(CampaignModel).filter(CampaignModel.id == campaign_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
