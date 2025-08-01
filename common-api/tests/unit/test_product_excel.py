import io
from unittest.mock import Mock, patch

import pandas as pd
import pytest
from sqlalchemy.orm import Session

from app.db.models.products import Product
from app.schemas.products import ColumnConfig, ExcelUploadConfig, ProductCreate
from app.services.product_excel_service import ProductExcelService


class TestProductExcelService:
    @pytest.fixture
    def service(self):
        return ProductExcelService()

    @pytest.fixture
    def mock_db(self):
        return Mock(spec=Session)

    @pytest.fixture
    def sample_config(self):
        return ExcelUploadConfig(
            columns=[
                ColumnConfig(column="Code", validation="required", db_field="code"),
                ColumnConfig(column="Name", validation="required", db_field="name"),
                ColumnConfig(
                    column="Quantity",
                    validation="optional",
                    format="to_int",
                    db_field="quantity",
                    default_value=0,
                ),
                ColumnConfig(
                    column="Price",
                    validation="optional",
                    format="to_float",
                    db_field="selling_price",
                    default_value=0.0,
                ),
            ],
            skip_header=False,  # Don't skip header
            batch_size=100,
        )

    def test_get_default_config(self, service):
        config = service.get_default_config()
        assert len(config.columns) > 0
        assert any(col.column == "Code" for col in config.columns)
        assert any(col.column == "Name" for col in config.columns)

    def test_read_excel_file(self, service, sample_config):
        # Create sample Excel data with headers as first row
        data = [
            ["Code", "Name", "Quantity", "Price"],  # Headers
            ["PROD001", "Product 1", 10, 100.50],   # Data row 1
            ["PROD002", "Product 2", 20, 200.75]    # Data row 2
        ]
        df = pd.DataFrame(data)

        # Save to bytes
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, header=False)
        output.seek(0)
        file_content = output.getvalue()

        # Test reading
        result_df = service.read_excel_file(file_content, sample_config)
        # Now we always use first row as headers, so we get 2 data rows
        assert len(result_df) == 2
        assert "Code" in result_df.columns
        assert "Name" in result_df.columns
        assert result_df.iloc[0]["Code"] == "PROD001"
        assert result_df.iloc[1]["Code"] == "PROD002"

    def test_read_excel_file_with_skip_rows(self, service, sample_config):
        # Create sample Excel data with headers and data
        data = [
            ["Code", "Name", "Quantity", "Price"],  # Headers
            ["SKIP1", "Skip1", "1", "1.00"],       # Row to skip
            ["PROD001", "Product 1", 10, 100.50],   # Data row 1
            ["PROD002", "Product 2", 20, 200.75]    # Data row 2
        ]
        df = pd.DataFrame(data)

        # Save to bytes
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="TestSheet", index=False, header=False)
        output.seek(0)
        file_content = output.getvalue()

        # Test reading with skip_rows=1 (skip one row)
        config_with_skip = ExcelUploadConfig(
            columns=sample_config.columns,
            skip_rows=1,  # Skip 1 additional row
            batch_size=100,
        )

        result_df = service.read_excel_file(file_content, config_with_skip)
        # Should get 2 data rows (PROD001, PROD002), skipping one row
        assert len(result_df) == 2
        assert "Code" in result_df.columns
        assert "Name" in result_df.columns
        assert result_df.iloc[0]["Code"] == "PROD001"
        assert result_df.iloc[1]["Code"] == "PROD002"

    def test_validate_row_valid(self, service, sample_config):
        row = pd.Series({
            "Code": "PROD001",
            "Name": "Test Product",
            "Quantity": "10",
            "Price": "100.50"
        })

        errors = service.validate_row(row, sample_config)
        assert len(errors) == 0

    def test_validate_row_missing_required(self, service, sample_config):
        row = pd.Series({
            "Code": "",
            "Name": "Test Product",
            "Quantity": "10",
            "Price": "100.50"
        })

        errors = service.validate_row(row, sample_config)
        assert len(errors) > 0
        assert any("Required field 'Code'" in error for error in errors)

    def test_row_to_product_create(self, service, sample_config):
        row = pd.Series({
            "Code": "PROD001",
            "Name": "Test Product",
            "Quantity": "10",
            "Price": "100.50"
        })

        product = service.row_to_product_create(row, sample_config)
        assert isinstance(product, ProductCreate)
        assert product.code == "PROD001"
        assert product.name == "Test Product"
        assert product.quantity == 10
        assert product.selling_price == 100.50

    def test_generate_excel_template(self, service, sample_config):
        template_bytes = service.generate_excel_template(sample_config)
        assert isinstance(template_bytes, bytes)
        assert len(template_bytes) > 0

    def test_generate_excel_template_with_skip_rows(self, service, sample_config):
        # Test template generation with skip_rows=1
        config_with_skip = ExcelUploadConfig(
            columns=sample_config.columns,
            skip_rows=1,  # Skip additional rows
            batch_size=100,
        )

        template = service.generate_excel_template(config_with_skip)
        assert isinstance(template, bytes)
        assert len(template) > 0

        # Verify the template contains sample data
        from io import BytesIO

        import pandas as pd

        df = pd.read_excel(BytesIO(template), engine="openpyxl")
        # Should have at least 1 row with sample data
        assert len(df) >= 1

    @patch('app.db.repositories.products.repo.product_repo')
    def test_process_excel_upload_success(
        self, mock_repo, service, mock_db, sample_config
    ):
        # Create sample Excel data with headers as first row
        data = [
            ["Code", "Name", "Quantity", "Price"],  # Headers
            ["PROD001", "Product 1", 10, 100.50],   # Data row 1
            ["PROD002", "Product 2", 20, 200.75]    # Data row 2
        ]
        df = pd.DataFrame(data)

        # Save to bytes
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="DataSheet", index=False, header=False)
        output.seek(0)
        file_content = output.getvalue()

        # Mock database queries
        mock_db.query.return_value.filter.return_value.first.return_value = None

        # Test upload
        result = service.process_excel_upload(mock_db, file_content, sample_config)

        # Now we always use first row as headers, so we get 2 data rows
        assert result.total_rows == 2
        assert result.successful_imports == 2
        assert result.failed_imports == 0
        assert "Successfully imported 2 products" in result.message

    @patch('app.db.repositories.products.repo.product_repo')
    def test_process_excel_upload_duplicate_code(
        self, mock_repo, service, mock_db, sample_config
    ):
        # Create sample Excel data with headers and duplicate code
        data = [
            ["Code", "Name", "Quantity", "Price"],  # Headers
            ["PROD001", "Product 1", 10, 100.50],   # Data row 1
            ["PROD001", "Product 2", 20, 200.75]    # Data row 2 (duplicate code)
        ]
        df = pd.DataFrame(data)

        # Save to bytes
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="DuplicateSheet", index=False, header=False)
        output.seek(0)
        file_content = output.getvalue()

        # Mock database queries - first product exists, second doesn't
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            Mock(spec=Product),  # First product exists
            None  # Second product doesn't exist
        ]

        # Test upload
        result = service.process_excel_upload(mock_db, file_content, sample_config)

        # Now we always use first row as headers, so we get 2 data rows
        assert result.total_rows == 2
        assert result.successful_imports == 1
        assert result.failed_imports == 1
        assert len(result.errors) == 1
