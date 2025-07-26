# Product Excel Upload Feature

This document describes the Excel upload functionality for products in the VRICH API.

## Overview

The Excel upload feature allows users to bulk import products from Excel files (.xlsx, .xls) with dynamic column configuration. The system supports:

- Dynamic column mapping
- Data validation
- Data formatting
- Batch processing
- Error reporting
- Template generation
- Multiple header row support (e.g., English + Thai headers)
- **Dynamic sheet detection**: Automatically reads from the first sheet in the Excel file

## Excel File Requirements

### Sheet Name
- **Automatic Detection**: The system automatically reads from the first sheet in the Excel file
- No specific sheet name is required - it will use `sheet_names[0]` (the first sheet)
- The system dynamically detects the sheet name and reads from it

### File Format
- Supported formats: `.xlsx`, `.xls`
- The system uses OpenPyXL engine for reading Excel files

## API Endpoints

### 1. Upload Excel File
```
POST /api/v1/products/upload-excel
```

**Parameters:**
- `file`: Excel file (.xlsx, .xls) - **Required**
- `config`: JSON string containing ExcelUploadConfig - **Optional**

**Important:** The `config` parameter must be sent as a JSON string in the form data, not as a raw JSON object.

**Example Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/products/upload-excel" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@products.xlsx" \
  -F 'config={"skip_rows": 1, "batch_size": 50}'
```

**Response:**
```json
{
  "total_rows": 10,
  "successful_imports": 8,
  "failed_imports": 2,
  "errors": [
    {
      "row": 3,
      "errors": ["Required field 'Code' is missing or empty"]
    }
  ],
  "message": "Successfully imported 8 products, 2 failed"
}
```

### 2. Download Template
```
GET /api/v1/products/upload-excel/template
```

**Parameters:**
- `config`: Optional custom configuration (query parameter)

**Response:** Excel file download

### 3. Get Default Configuration
```
GET /api/v1/products/upload-excel/config
```

**Response:**
```json
{
  "columns": [
    {
      "column": "Code",
      "validation": "required",
      "format": null,
      "db_field": "code",
      "default_value": null
    },
    {
      "column": "Name",
      "validation": "required",
      "format": null,
      "db_field": "name",
      "default_value": null
    }
  ],
  "skip_header": true,
  "skip_rows": 0,
  "batch_size": 100
}
```

### 4. Update Configuration
```
POST /api/v1/products/upload-excel/config
```

**Request Body:** ExcelUploadConfig object (all fields optional)

**Example:**
```json
{
  "skip_rows": 1,
  "batch_size": 50
}
```

**Note:** You can send partial configurations. Any missing fields will use their default values.

## Flexible Configuration

The `ExcelUploadConfig` now supports flexible configuration where all fields are optional:

- `columns`: List of column configurations (optional, uses default if not provided)
- `skip_header`: Whether to skip the first row as header (optional, defaults to `true`)
- `skip_rows`: Number of additional rows to skip after header (optional, defaults to `0`)
- `batch_size`: Number of rows to process in each batch (optional, defaults to `100`)

**Examples:**

1. **Only change skip_rows:**
   ```json
   {
     "skip_rows": 1
   }
   ```

2. **Only change batch_size:**
   ```json
   {
     "batch_size": 50
   }
   ```

3. **Multiple changes:**
   ```json
   {
     "skip_rows": 1,
     "batch_size": 50,
     "skip_header": false
   }
   ```

## Column Configuration

Each column can be configured with the following properties:

### ColumnConfig Properties

- `column`: Excel column name (string)
- `validation`: Comma-separated validation rules (string)
- `format`: Format function name (string, optional)
- `db_field`: Database field name (string)
- `default_value`: Default value if field is empty (any)

### Supported Validation Rules

The validation system uses a dedicated `ValidationService` that provides robust validation using Pydantic-style validation rules:

- `required`: Field must not be empty
- `optional`: Field can be empty
- `positive_number`: Must be a positive number (> 0)
- `non_negative_number`: Must be a non-negative number (≥ 0)
- `min_length:N`: String must be at least N characters long
- `max_length:N`: String must be no more than N characters long
- `unique`: Value must be unique (checked against database)
- `email`: Must be a valid email format
- `url`: Must be a valid URL format
- `integer`: Must be a valid integer
- `float`: Must be a valid float

### Validation Service Architecture

The validation system is built using a dedicated `ValidationService` class that:

- **Centralized Validation Logic**: All validation rules are defined in one place
- **Extensible**: Easy to add new validation rules
- **Error Handling**: Proper exception handling with clear error messages
- **Parameter Support**: Supports validation rules with parameters (e.g., `min_length:2`)
- **Type Safety**: Uses proper type hints and Pydantic integration

### Validation Examples

```json
{
  "column": "Code",
  "validation": "required,unique",
  "db_field": "code"
}
```

```json
{
  "column": "Name", 
  "validation": "required,min_length:2",
  "db_field": "name"
}
```

```json
{
  "column": "Quantity",
  "validation": "optional,positive_number",
  "format": "to_int",
  "db_field": "quantity",
  "default_value": 0
}
```

```json
{
  "column": "Description",
  "validation": "optional,max_length:500",
  "db_field": "description"
}
```

### Available Format Functions

- `uppercase`: Convert to uppercase
- `lowercase`: Convert to lowercase
- `strip`: Remove leading/trailing whitespace
- `to_int`: Convert to integer
- `to_float`: Convert to float
- `to_string`: Convert to string
- `capitalize`: Capitalize first letter

## Multiple Header Row Support

The system supports Excel files with multiple header rows, which is useful for international applications (e.g., English + Thai headers).

### Configuration Options

- `skip_header`: If `true`, uses the first row as column headers
- `skip_rows`: Number of additional rows to skip after the header row

### Example: English + Thai Headers

For Excel files structured like this:
```
Row 1: Code    Name    Description    Quantity    Unit    ...
Row 2: รหัสสินค้า    ชื่อสินค้า    รายละเอียดสินค้า    จำนวน    หน่วย    ...
Row 3: PROD001    Product 1    Description 1    10    pcs    ...
Row 4: PROD002    Product 2    Description 2    20    pcs    ...
```

Configuration:
```json
{
  "skip_header": true,
  "skip_rows": 1
}
```

This will:
1. Use Row 1 (English) as column headers
2. Skip Row 2 (Thai headers)
3. Start processing data from Row 3

### Template Generation

When `skip_rows > 0`, the generated template includes:
- Row 1: English column headers
- Row 2: Thai column headers (example)
- Row 3+: Sample data

## Default Column Mapping

| Excel Column | DB Field | Validation | Format | Default |
|--------------|----------|------------|--------|---------|
| Code | code | required | - | - |
| Name | name | required | - | - |
| Description | description | optional | - | - |
| Quantity | quantity | optional | to_int | 0 |
| Unit | unit | optional | - | - |
| Full Price | full_price | optional | to_float | 0.0 |
| Selling Price | selling_price | optional | to_float | 0.0 |
| Cost | cost | optional | to_float | 0.0 |
| Shipping Fee | shipping_fee | optional | to_float | 0.0 |
| Note | note | optional | - | - |
| Type | product_type | optional | - | - |
| Category | product_category | optional | - | - |
| Color | color | optional | - | - |
| Size | size | optional | - | - |
| Weight | weight | optional | to_float | 0.0 |
| Default Keyword | keyword | optional | - | - |

## Usage Examples

### Basic Upload
```bash
curl -X POST "http://localhost:8000/api/v1/products/upload-excel" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@products.xlsx"
```

### Upload with Custom Configuration
```bash
curl -X POST "http://localhost:8000/api/v1/products/upload-excel" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@products.xlsx" \
  -F 'config={
    "columns": [
      {
        "column": "Product Code",
        "validation": "required",
        "db_field": "code"
      },
      {
        "column": "Product Name",
        "validation": "required",
        "db_field": "name"
      }
    ],
    "skip_header": true,
    "batch_size": 50
  }'
```

### Upload with Thai Headers
```bash
curl -X POST "http://localhost:8000/api/v1/products/upload-excel" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@products_thai.xlsx" \
  -F 'config={
    "skip_header": true,
    "skip_rows": 1
  }'
```

### Download Template
```bash
curl -X GET "http://localhost:8000/api/v1/products/upload-excel/template" \
  -o product_template.xlsx
```

## Error Handling

The system provides detailed error reporting:

1. **Validation Errors**: Missing required fields, invalid data types
2. **Format Errors**: Issues with data formatting functions
3. **Duplicate Errors**: Products with existing codes
4. **System Errors**: Unexpected errors during processing

Each error includes:
- Row number
- Specific error messages
- Field names where applicable

## Performance Considerations

- **Batch Processing**: Products are processed in configurable batches (default: 100)
- **Transaction Safety**: Each batch is committed separately
- **Memory Management**: Large files are processed row by row
- **Error Recovery**: Failed rows don't affect successful imports

## Testing

Run the test suite:
```bash
pytest tests/unit/test_product_excel.py -v
```

Generate sample files:
```bash
python sample_products_template.py
```

## Future Enhancements

1. **Custom Format Functions**: Allow user-defined formatting functions
2. **Data Validation Rules**: More complex validation rules (regex, ranges, etc.)
3. **Update Mode**: Support for updating existing products
4. **Progress Tracking**: Real-time upload progress
5. **File Validation**: Pre-upload file structure validation
6. **Template Customization**: User-defined template layouts 