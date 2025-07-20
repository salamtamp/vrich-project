from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.payments import Payment as PaymentModel
from app.db.repositories.payments.repo import payment_repo
from app.db.session import get_db
from app.schemas.payments import Payment, PaymentCreate, PaymentUpdate

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Payment])
def list_payments(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Payment]:
    builder = PaginationBuilder(PaymentModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=Payment)
    )


@router.get("/{payment_id}", response_model=Payment)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
) -> Payment:
    payment = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment


@router.post("/", response_model=Payment, status_code=status.HTTP_201_CREATED)
def create_payment(
    *, db: Session = Depends(get_db), payment_in: PaymentCreate
) -> Payment:
    return payment_repo.create(db, obj_in=payment_in)


@router.put("/{payment_id}", response_model=Payment)
def update_payment(
    *, db: Session = Depends(get_db), payment_id: UUID, payment_in: PaymentUpdate
) -> Payment:
    db_obj = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment_repo.update(db, db_obj=db_obj, obj_in=payment_in)


@router.delete("/{payment_id}", response_model=Payment)
def delete_payment(*, db: Session = Depends(get_db), payment_id: UUID) -> Payment:
    db_obj = db.query(PaymentModel).filter(PaymentModel.id == payment_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(db_obj)
    db.commit()
    return db_obj
