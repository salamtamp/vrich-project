#!/usr/bin/env python3
"""
Script to generate a sample Excel template for product upload testing.
"""

import pandas as pd

from app.services.product_excel_service import product_excel_service


def generate_sample_template():
    """Generate a sample Excel template with product data."""
    # Get default configuration
    config = product_excel_service.get_default_config()

    # Generate standard template
    template_bytes = product_excel_service.generate_excel_template(config)
    from pathlib import Path
    Path("sample_products_template.xlsx").write_bytes(template_bytes)
    print("Standard template generated: sample_products_template.xlsx")

    # Generate template with Thai headers (skip_rows=1)
    config_with_thai = product_excel_service.get_default_config()
    config_with_thai.skip_header = True
    config_with_thai.skip_rows = 1

    template_with_thai = product_excel_service.generate_excel_template(config_with_thai)
    Path("sample_products_template_thai.xlsx").write_bytes(template_with_thai)
    print("Template with Thai headers generated: sample_products_template_thai.xlsx")

    # Create sample data file with English headers
    sample_data = {
        "Code": ["PROD001", "PROD002", "PROD003"],
        "Name": ["Sample Product 1", "Sample Product 2", "Sample Product 3"],
        "Description": [
            "Description for product 1",
            "Description for product 2",
            "Description for product 3",
        ],
        "Quantity": [10, 20, 15],
        "Unit": ["pcs", "pcs", "pcs"],
        "Full Price": [150.00, 200.00, 175.50],
        "Selling Price": [120.00, 160.00, 140.00],
        "Cost": [80.00, 100.00, 90.00],
        "Shipping Fee": [10.00, 15.00, 12.50],
        "Note": ["Sample note 1", "Sample note 2", "Sample note 3"],
        "Type": ["Electronics", "Clothing", "Home"],
        "Category": ["Gadgets", "Shirts", "Kitchen"],
        "Color": ["Black", "Blue", "White"],
        "Size": ["M", "L", "One Size"],
        "Weight": [0.5, 0.3, 1.2],
        "Default Keyword": ["gadget", "shirt", "kitchen"],
    }

    df = pd.DataFrame(sample_data)
    with pd.ExcelWriter("sample_products_data.xlsx", engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Products", index=False)
    print("Sample data file generated: sample_products_data.xlsx")

    # Create sample data file with English + Thai headers
    thai_headers = {
        "Code": "รหัสสินค้า",
        "Name": "ชื่อสินค้า",
        "Description": "รายละเอียดสินค้า",
        "Quantity": "จำนวน",
        "Unit": "หน่วย",
        "Full Price": "ราคาเต็ม",
        "Selling Price": "ราคาขาย",
        "Cost": "ต้นทุน",
        "Shipping Fee": "ค่าส่ง",
        "Note": "หมายเหตุ",
        "Type": "ประเภทของสินค้า",
        "Category": "กลุ่มของสินค้า",
        "Color": "สี",
        "Size": "ไซส์",
        "Weight": "น้ำหนัก",
        "Default Keyword": "คีย์เวิร์ด"
    }

    # Create DataFrame with English headers
    df_english = pd.DataFrame(columns=sample_data.keys())

    # Create DataFrame with Thai headers
    thai_row = [thai_headers.get(col, col) for col in sample_data]
    df_thai = pd.DataFrame([thai_row], columns=sample_data.keys())

    # Create DataFrame with data
    df_data = pd.DataFrame(sample_data)

    # Combine all
    df_combined = pd.concat([df_english, df_thai, df_data], ignore_index=True)

    with pd.ExcelWriter("sample_products_data_thai.xlsx", engine="openpyxl") as writer:
        df_combined.to_excel(writer, sheet_name="Products", index=False)
    print(
        "Sample data file with Thai headers generated: sample_products_data_thai.xlsx"
    )


if __name__ == "__main__":
    generate_sample_template()
 