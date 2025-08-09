from datetime import UTC, datetime
from enum import Enum
from typing import Generic, TypeVar

import sqlalchemy as sa
from fastapi import HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session


class OrderDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"


class PaginationParams(BaseModel):
    limit: int | None = Field(default=None, ge=1, le=1000000)
    offset: int = Field(default=0, ge=0)
    order: OrderDirection = Field(default=OrderDirection.DESC)
    order_by: str = Field(default="created_at")
    search: str | None = Field(default=None)
    search_by: str | None = Field(default=None)
    since: datetime | None = Field(default=None)
    until: datetime | None = Field(default=None)


T = TypeVar("T")


# PaginationResponse uses Generic[T] as required by typing and pydantic generics
class PaginationResponse(BaseModel, Generic[T]):
    total: int
    docs: list[T]
    limit: int
    offset: int
    has_next: bool
    has_prev: bool
    timestamp: datetime


class PaginationBuilder:
    """Dynamic pagination builder for easy database integration"""

    def __init__(self, model, session: Session):
        self.model = model
        self.session = session
        self.query = session.query(model)
        self.count_query = session.query(sa.func.count(model.id))

    def filter_deleted(self, include_deleted: bool = False):
        if not include_deleted and hasattr(self.model, "deleted_at"):
            self.query = self.query.filter(self.model.deleted_at.is_(None))
            self.count_query = self.count_query.filter(self.model.deleted_at.is_(None))
        return self

    def date_range(self, since: datetime | None = None, until: datetime | None = None):
        if since:
            self.query = self.query.filter(self.model.created_at >= since)
            self.count_query = self.count_query.filter(self.model.created_at >= since)
        if until:
            self.query = self.query.filter(self.model.created_at <= until)
            self.count_query = self.count_query.filter(self.model.created_at <= until)
        return self

    def search(self, search: str | None = None, search_by: str | None = None):
        if search and search_by and hasattr(self.model, search_by):
            column = getattr(self.model, search_by)
            if hasattr(column.type, "python_type") and column.type.python_type is str:
                search_filter = column.ilike(f"%{search}%")
                self.query = self.query.filter(search_filter)
                self.count_query = self.count_query.filter(search_filter)
            else:
                search_filter = column == search
                self.query = self.query.filter(search_filter)
                self.count_query = self.count_query.filter(search_filter)
        return self

    def custom_filter(self, **filters):
        for key, value in filters.items():
            if hasattr(self.model, key) and value is not None:
                column = getattr(self.model, key)
                if isinstance(value, list):
                    filter_condition = column.in_(value)
                else:
                    filter_condition = column == value
                self.query = self.query.filter(filter_condition)
                self.count_query = self.count_query.filter(filter_condition)
        return self

    def order_by(
        self, order_by: str = "created_at", order: OrderDirection = OrderDirection.DESC
    ):
        if hasattr(self.model, order_by):
            column = getattr(self.model, order_by)
            if order == OrderDirection.DESC:
                self.query = self.query.order_by(column.desc())
            else:
                self.query = self.query.order_by(column.asc())
        return self

    def paginate(
        self, limit: int | None = None, offset: int = 0, serializer: type[T] | None = None
    ) -> PaginationResponse[T]:
        total = self.count_query.scalar()
        query = self.query.offset(offset)
        if limit is not None:
            query = query.limit(limit)
        items = query.all()
        if serializer:
            docs = [serializer.from_orm(item) for item in items]
        else:
            docs = []
            for item in items:
                if hasattr(item, "__dict__"):
                    doc = {
                        key: value
                        for key, value in item.__dict__.items()
                        if not key.startswith("_")
                    }
                    docs.append(doc)
                else:
                    docs.append(item)
        has_next = False if limit is None else (offset + limit) < total
        has_prev = offset > 0
        return PaginationResponse[T](
            total=total,
            docs=docs,
            limit=(limit if limit is not None else len(items)),
            offset=offset,
            has_next=has_next,
            has_prev=has_prev,
            timestamp=datetime.now(UTC),
        )


def get_pagination_params(
    limit: int | None = Query(None, ge=1, le=1000000, description="Number of items per page"),
    offset: int = Query(0, ge=0, description="Number of items to skip"),
    order: OrderDirection = Query(OrderDirection.DESC, description="Sort order"),
    order_by: str = Query("created_at", description="Field to sort by"),
    search: str | None = Query(None, description="Search term"),
    search_by: str | None = Query(None, description="Field to search in"),
    since: datetime | None = Query(
        None, description="Filter records created after this date"
    ),
    until: datetime | None = Query(
        None, description="Filter records created before this date"
    ),
) -> PaginationParams:
    return PaginationParams(
        limit=limit,
        offset=offset,
        order=order,
        order_by=order_by,
        search=search,
        search_by=search_by,
        since=since,
        until=until,
    )


def create_pagination_dependency(
    allowed_order_by: list[str] | None = None,
    allowed_search_by: list[str] | None = None,
    default_order_by: str = "created_at",
):
    def get_validated_pagination_params(
        limit: int | None = Query(None, ge=1, le=1000000),
        offset: int = Query(0, ge=0),
        order: OrderDirection = Query(OrderDirection.DESC),
        order_by: str = Query(default_order_by),
        search: str | None = Query(None),
        search_by: str | None = Query(None),
        since: datetime | None = Query(None),
        until: datetime | None = Query(None),
    ) -> PaginationParams:
        if allowed_order_by and order_by not in allowed_order_by:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid order_by field. Allowed: {allowed_order_by}",
            )
        if search_by and allowed_search_by and search_by not in allowed_search_by:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid search_by field. Allowed: {allowed_search_by}",
            )
        if search and not search_by:
            raise HTTPException(
                status_code=400,
                detail="search_by parameter is required when search is provided",
            )
        return PaginationParams(
            limit=limit,
            offset=offset,
            order=order,
            order_by=order_by,
            search=search,
            search_by=search_by,
            since=since,
            until=until,
        )

    return get_validated_pagination_params
