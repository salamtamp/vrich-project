from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.campaigns_notifications import (
    CampaignNotification as CampaignNotificationModel,
)
from app.db.repositories.campaigns_notifications.repo import campaign_notification_repo
from app.db.session import get_db
from app.schemas.campaigns_notifications import (
    CampaignNotification,
    CampaignNotificationCreate,
    CampaignNotificationUpdate,
)

router = APIRouter()


@router.get("/", response_model=PaginationResponse[CampaignNotification])
def list_campaign_notifications(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[CampaignNotification]:
    builder = PaginationBuilder(CampaignNotificationModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=CampaignNotification)
    )


@router.get("/{notification_id}", response_model=CampaignNotification)
def get_campaign_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
) -> CampaignNotification:
    notification = (
        db.query(CampaignNotificationModel)
        .filter(CampaignNotificationModel.id == notification_id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="CampaignNotification not found")
    return notification


@router.post(
    "/", response_model=CampaignNotification, status_code=status.HTTP_201_CREATED
)
def create_campaign_notification(
    *, db: Session = Depends(get_db), notification_in: CampaignNotificationCreate
) -> CampaignNotification:
    return campaign_notification_repo.create(db, obj_in=notification_in)


@router.put("/{notification_id}", response_model=CampaignNotification)
def update_campaign_notification(
    *,
    db: Session = Depends(get_db),
    notification_id: UUID,
    notification_in: CampaignNotificationUpdate
) -> CampaignNotification:
    db_obj = (
        db.query(CampaignNotificationModel)
        .filter(CampaignNotificationModel.id == notification_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="CampaignNotification not found")
    return campaign_notification_repo.update(db, db_obj=db_obj, obj_in=notification_in)


@router.delete("/{notification_id}", response_model=CampaignNotification)
def delete_campaign_notification(
    *, db: Session = Depends(get_db), notification_id: UUID
) -> CampaignNotification:
    db_obj = (
        db.query(CampaignNotificationModel)
        .filter(CampaignNotificationModel.id == notification_id)
        .first()
    )
    if not db_obj:
        raise HTTPException(status_code=404, detail="CampaignNotification not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
