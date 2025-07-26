import logging
from collections.abc import Callable

from sqlalchemy.orm import Session

from app.db.models.products import Product
from app.db.repositories.products.repo import product_repo
from app.schemas.products import (
    ColumnConfig,
    ExcelUploadConfig,
    ExcelUploadResponse,
    ProductCreate,
)

logger = logging.getLogger(__name__)


class ProductExcelService:
    """Service for handling Excel uploads for products with dynamic column configuration."""  # noqa: E501

    def __init__(self):
        self.format_functions: dict[str, Callable] = {
            "uppercase": str.upper,
            "lowercase": str.lower,
            "strip": str.strip,
            "to_int": lambda x: int(float(x)) if x and str(x).strip() else 0,
            "to_float": lambda x: float(x) if x and str(x).strip() else 0.0,
            "to_string": str,
            "capitalize": str.capitalize,
        }

    def get_default_config(self) -> ExcelUploadConfig:
        """Get default column configuration for product Excel upload."""
        return ExcelUploadConfig(
            columns=[
                ColumnConfig(column="Code", validation="required", db_field="code"),
                ColumnConfig(column="Name", validation="required", db_field="name"),
                ColumnConfig(
                    column="Description", validation="optional", db_field="description"
                ),
                ColumnConfig(
                    column="Quantity",
                    validation="optional",
                    format="to_int",
                    db_field="quantity",
                    default_value=0,
                ),
                ColumnConfig(column="Unit", validation="optional", db_field="unit"),
                ColumnConfig(
                    column="Full Price",
                    validation="optional",
                    format="to_float",
                    db_field="full_price",
                    default_value=0.0,
                ),
                ColumnConfig(
                    column="Selling Price",
                    validation="optional",
                    format="to_float",
                    db_field="selling_price",
                    default_value=0.0,
                ),
                ColumnConfig(
                    column="Cost",
                    validation="optional",
                    format="to_float",
                    db_field="cost",
                    default_value=0.0,
                ),
                ColumnConfig(
                    column="Shipping Fee",
                    validation="optional",
                    format="to_float",
                    db_field="shipping_fee",
                    default_value=0.0,
                ),
                ColumnConfig(column="Note", validation="optional", db_field="note"),
                ColumnConfig(
                    column="Type", validation="optional", db_field="product_type"
                ),
                ColumnConfig(
                    column="Category",
                    validation="optional",
                    db_field="product_category"
                ),
                ColumnConfig(column="Color", validation="optional", db_field="color"),
                ColumnConfig(column="Size", validation="optional", db_field="size"),
                ColumnConfig(
                    column="Weight",
                    validation="optional",
                    format="to_float",
                    db_field="weight",
                    default_value=0.0,
                ),
                ColumnConfig(
                    column="Default Keyword", validation="optional", db_field="keyword"
                ),
            ]
        )

    def generate_excel_template(self, config: ExcelUploadConfig | None = None) -> bytes:
        """Generate Excel template file with configured columns."""
        import pandas as pd

        if config is None:
            config = self.get_default_config()

        # Create DataFrame with column headers
        columns = [col.column for col in config.columns]

        # Prepare sample data
        sample_data = {}
        for col_config in config.columns:
            if col_config.default_value is not None:
                sample_data[col_config.column] = col_config.default_value
            elif col_config.validate == "required":
                sample_data[col_config.column] = f"Sample {col_config.column}"
            else:
                sample_data[col_config.column] = ""

        # Create template with multiple header rows if skip_rows > 0
        if config.skip_rows > 0:
            # Create DataFrame with English headers (first row)
            df_english = pd.DataFrame([columns], columns=columns)

            # Create DataFrame with Thai headers (second row)
            thai_headers = {
                "Code": "รหัสสินค้า",
                "Name": "ชื่อสินค้า",
                "Description": "รายละเอียดสินค้า",
                "Quantity": "จำนวน",
                "Unit": "หน่วย",
                "Full Price": "ราคาเต็ม",
                "Selling Price": "ราคาขาย",
                "Cost": "ต้นทุน",
                "Profit": "กำไร",
                "Shipping Fee": "ค่าส่ง",
                "Note": "หมายเหตุ",
                "Type": "ประเภทของสินค้า",
                "Category": "กลุ่มของสินค้า",
                "Color": "สี",
                "Size": "ไซส์",
                "Weight": "น้ำหนัก",
                "Default Keyword": "คีย์เวิร์ด"
            }

            thai_row = [thai_headers.get(col, col) for col in columns]
            df_thai = pd.DataFrame([thai_row], columns=columns)

            # Create DataFrame with sample data (third row)
            df_sample = pd.DataFrame([sample_data])

            # Combine all rows
            df_final = pd.concat([df_english, df_thai, df_sample], ignore_index=True)
        else:
            # Standard template with just English headers and sample data
            df_final = pd.DataFrame([sample_data])

        # Create Excel file in memory
        from io import BytesIO
        output = BytesIO()

        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df_final.to_excel(writer, sheet_name="Products", index=False)

            # Add formatting and validation
            # Note: Adding comments requires more complex openpyxl setup
            # For now, we'll skip comments to avoid complexity

        output.seek(0)
        return output.getvalue()

    def read_excel_file(
        self, file_content: bytes, config: ExcelUploadConfig
    ):
        """Read Excel file and return DataFrame."""
        import pandas as pd

        try:
            from io import BytesIO
            df = pd.read_excel(BytesIO(file_content), engine="openpyxl")

            if config.skip_header:
                # Use first row as header
                df.columns = df.iloc[0]
                # Skip the header row (row 0) plus any additional rows specified
                start_row = 1 + config.skip_rows
                df = df.iloc[start_row:].reset_index(drop=True)

            return df
        except Exception as e:
            logger.error(f"Error reading Excel file: {e}")
            raise ValueError(f"Failed to read Excel file: {e!s}") from e

    def validate_row(self, row, config: ExcelUploadConfig) -> list[str]:
        """Validate a single row against the configuration."""
        import pandas as pd

        errors = []

        for col_config in config.columns:
            column_name = col_config.column
            value = row.get(column_name)

            # Check required fields
            if (
                col_config.validation == "required"
                and (pd.isna(value) or str(value).strip() == "")
            ):
                errors.append(f"Required field '{column_name}' is missing or empty")
                continue

            # Apply formatting if specified
            if col_config.format and not pd.isna(value) and str(value).strip() != "":
                try:
                    format_func = self.format_functions.get(col_config.format)
                    if format_func:
                        # Apply the format function
                        formatted_value = format_func(str(value).strip())
                        row[column_name] = formatted_value
                except Exception as e:
                    errors.append(f"Error formatting field '{column_name}': {e!s}")

        return errors

    def row_to_product_create(
        self, row, config: ExcelUploadConfig
    ) -> ProductCreate:
        """Convert a DataFrame row to ProductCreate object."""
        import pandas as pd

        product_data = {}

        for col_config in config.columns:
            column_name = col_config.column
            value = row.get(column_name)

            # Handle missing values
            if pd.isna(value) or str(value).strip() == "":
                if col_config.default_value is not None:
                    value = col_config.default_value
                else:
                    value = None

            # Convert to appropriate type
            if col_config.format == "to_int":
                value = int(float(value)) if value is not None else 0
            elif col_config.format == "to_float":
                value = float(value) if value is not None else 0.0
            elif value is not None:
                value = str(value).strip()

            product_data[col_config.db_field] = value

        return ProductCreate(**product_data)

    def process_excel_upload(
        self,
        db: Session,
        file_content: bytes,
        config: ExcelUploadConfig | None = None
    ) -> ExcelUploadResponse:
        """Process Excel file upload and import products."""

        if config is None:
            config = self.get_default_config()

        try:
            # Read Excel file
            df = self.read_excel_file(file_content, config)
            total_rows = len(df)

            successful_imports = 0
            failed_imports = 0
            errors = []

            # Process rows in batches
            for batch_start in range(0, total_rows, config.batch_size):
                batch_end = min(batch_start + config.batch_size, total_rows)
                batch_df = df.iloc[batch_start:batch_end]

                for index, row in batch_df.iterrows():
                    row_number = index + 1

                    try:
                        # Validate row
                        validation_errors = self.validate_row(row, config)
                        if validation_errors:
                            failed_imports += 1
                            errors.append({
                                "row": row_number,
                                "errors": validation_errors
                            })
                            continue

                        # Convert to ProductCreate
                        product_create = self.row_to_product_create(row, config)

                        # Check if product with same code already exists
                        existing_product = (
                            db.query(Product)
                            .filter(Product.code == product_create.code)
                            .first()
                        )
                        if existing_product:
                            failed_imports += 1
                            errors.append({
                                "row": row_number,
                                "errors": [
                                    f"Product with code '{product_create.code}' already exists"  # noqa: E501
                                ],
                            })
                            continue

                        # Create product
                        product_repo.create(db, obj_in=product_create)
                        successful_imports += 1

                    except Exception as e:
                        failed_imports += 1
                        errors.append({
                            "row": row_number,
                            "errors": [f"Unexpected error: {e!s}"]
                        })
                        logger.error(f"Error processing row {row_number}: {e}")

                # Commit batch
                db.commit()

            message = f"Successfully imported {successful_imports} products"
            if failed_imports > 0:
                message += f", {failed_imports} failed"

            return ExcelUploadResponse(
                total_rows=total_rows,
                successful_imports=successful_imports,
                failed_imports=failed_imports,
                errors=errors,
                message=message
            )

        except Exception as e:
            logger.error(f"Error processing Excel upload: {e}")
            db.rollback()
            raise ValueError(f"Failed to process Excel upload: {e!s}") from e


# Create service instance
product_excel_service = ProductExcelService()
