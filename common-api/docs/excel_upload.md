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

## API Endpoints

### 1. Upload Excel File
```
POST /api/v1/products/upload-excel
```

**Parameters:**
- `file`: Excel file (.xlsx, .xls)
- `config`: Optional custom configuration (JSON)

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
      "validate": "required",
      "format": null,
      "db_field": "code",
      "default_value": null
    },
    {
      "column": "Name",
      "validate": "required",
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

**Request Body:** ExcelUploadConfig object

## Column Configuration

Each column can be configured with the following properties:

### ColumnConfig Properties

- `column`: Excel column name (string)
- `validate`: Validation level ("required" | "optional")
- `format`: Format function name (string, optional)
- `db_field`: Database field name (string)
- `default_value`: Default value if field is empty (any)

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
        "validate": "required",
        "db_field": "code"
      },
      {
        "column": "Product Name",
        "validate": "required",
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