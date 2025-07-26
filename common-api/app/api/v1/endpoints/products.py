from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies.pagination import (
    PaginationBuilder,
    PaginationParams,
    PaginationResponse,
    get_pagination_params,
)
from app.db.models.products import Product as ProductModel
from app.db.repositories.products.repo import product_repo
from app.db.session import get_db
from app.schemas.products import (
    ExcelUploadConfig,
    ExcelUploadResponse,
    Product,
    ProductCreate,
    ProductUpdate,
)
from app.services.product_excel_service import product_excel_service

router = APIRouter()


@router.get("/", response_model=PaginationResponse[Product])
def list_products(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
) -> PaginationResponse[Product]:
    builder = PaginationBuilder(ProductModel, db)
    return (
        builder.filter_deleted()
        .date_range(pagination.since, pagination.until)
        .search(pagination.search, pagination.search_by)
        .order_by(pagination.order_by, pagination.order)
        .paginate(pagination.limit, pagination.offset, serializer=Product)
    )


@router.get("/{product_id}", response_model=Product)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
) -> Product:
    product = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=Product, status_code=status.HTTP_201_CREATED)
def create_product(
    *, db: Session = Depends(get_db), product_in: ProductCreate
) -> Product:
    return product_repo.create(db, obj_in=product_in)


@router.put("/{product_id}", response_model=Product)
def update_product(
    *, db: Session = Depends(get_db), product_id: UUID, product_in: ProductUpdate
) -> Product:
    db_obj = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_repo.update(db, db_obj=db_obj, obj_in=product_in)


@router.delete("/{product_id}", response_model=Product)
def delete_product(*, db: Session = Depends(get_db), product_id: UUID) -> Product:
    db_obj = db.query(ProductModel).filter(ProductModel.id == product_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_obj)
    db.commit()
    return db_obj


@router.post("/upload-excel", response_model=ExcelUploadResponse)
async def upload_excel_products(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    skip_rows: int = Form(0),
    batch_size: int = Form(100),
) -> ExcelUploadResponse:
    """Upload products from Excel file."""
    if not file.filename or not file.filename.lower().endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="File must be an Excel file (.xlsx or .xls)"
        )

    try:
        file_content = await file.read()
        
        config = ExcelUploadConfig(
            skip_rows=skip_rows,
            batch_size=batch_size,
        )
        
        return product_excel_service.process_excel_upload(db, file_content, config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {e!s}"
        ) from e


@router.get("/upload-excel/config", response_model=ExcelUploadConfig)
def get_excel_upload_config() -> ExcelUploadConfig:
    """Get default Excel upload configuration."""
    return product_excel_service.get_default_config()


@router.post("/upload-excel/config", response_model=ExcelUploadConfig)
def update_excel_upload_config(config: ExcelUploadConfig) -> ExcelUploadConfig:
    """Update Excel upload configuration."""
    return config


@router.get("/upload-excel/template")
def download_excel_template(config: ExcelUploadConfig | None = None) -> Response:
    """Download Excel template file."""
    try:
        excel_content = product_excel_service.generate_excel_template(config)
        return Response(
            content=excel_content,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": "attachment; filename=product_template.xlsx"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate template: {e!s}"
        ) from e
