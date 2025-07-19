import uuid
from typing import TypeVar
from uuid import UUID

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import Base

ModelType = TypeVar("ModelType", bound=Base)  # type: ignore
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase[
    ModelType: Base,  # type: ignore
    CreateSchemaType: BaseModel,
    UpdateSchemaType: BaseModel,
]:
    def __init__(self, model: type[ModelType]):
        self.model = model

    def get(self, db: Session, _id: UUID | str) -> ModelType | None:
        # Convert string id to UUID if needed
        id_column = getattr(self.model, "id", None)
        if (
            id_column is not None
            and hasattr(id_column.type, "python_type")
            and id_column.type.python_type is uuid.UUID
            and isinstance(_id, str)
        ):
            _id = uuid.UUID(_id)
        return db.query(self.model).filter(self.model.id == _id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 1000000
    ) -> list[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = obj_in.model_dump(
            exclude_unset=False
        )  # Use model_dump to preserve datetime objects
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType | dict[str, object],
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: UUID) -> ModelType:
        obj = db.get(self.model, id)
        db.delete(obj)
        db.commit()
        return obj
