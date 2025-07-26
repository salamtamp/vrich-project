from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
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
    request: Request,
) -> ExcelUploadResponse:
    """Upload products from Excel file."""
    
    # Backend debugging
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("=== BACKEND DEBUG START ===")
    logger.info(f"Received file: {file}")
    logger.info(f"File filename: {file.filename}")
    logger.info(f"File content_type: {file.content_type}")
    logger.info(f"File size: {file.size if hasattr(file, 'size') else 'unknown'}")
    logger.info(f"Skip rows: {skip_rows}")
    logger.info(f"Batch size: {batch_size}")
    
    # Log request details
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request URL: {request.url}")
    logger.info("=== BACKEND DEBUG END ===")
    
    if not file.filename or not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=400, detail="File must be an Excel file (.xlsx or .xls)"
        )

    try:
        file_content = await file.read()
        logger.info(f"File content length: {len(file_content)} bytes")

        config = ExcelUploadConfig(
            skip_rows=skip_rows,
            batch_size=batch_size,
        )

        result = product_excel_service.process_excel_upload(db, file_content, config)
        
        # If there are any failed imports, return 400 status code
        if result.failed_imports > 0:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=400,
                content=result.model_dump()
            )
        
        return result
    except ValueError as e:
        logger.error(f"ValueError in upload: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Exception in upload: {e}")
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {e!s}"
        ) from e
