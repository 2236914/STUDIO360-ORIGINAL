# Shopee Data Converter

## Overview
Converts Shopee analytics data to forecasting format for database import.

## Usage

### Command Line
```bash
# Basic usage
python scripts/convert_shopee_data.py

# With custom input/output files
python scripts/convert_shopee_data.py input/shopee_data.json output/forecast_data.json

# Using npm scripts
npm run convert:shopee
```

### Input Format
Expected JSON format from Shopee analytics export:
```json
[
  {
    "Item ID": 22476841972,
    "Product": "WAVE TO EARTH Bracelets",
    "Current Item Status": "Normal",
    "SKU": "-",
    "Parent SKU": "w2e-ver1",
    "Product Page Views": 11234,
    "Units (Add to Cart)": 1144,
    "Units (Confirmed Order)": 150,
    "Sales (Confirmed Order) (PHP)": "19,464"
  }
]
```

### Output Format
Forecast-ready JSON format:
```json
[
  {
    "item_id": 22476841972,
    "product_name": "WAVE TO EARTH Bracelets",
    "product_sku": "w2e-ver1",
    "platform": "Shopee",
    "metrics": {
      "page_views": 11234,
      "add_to_cart_units": 1144,
      "confirmed_units": 150,
      "sales_amount": 19464
    },
    "conversion_rate": 1.34,
    "import_date": "2025-01-22"
  }
]
```

## Deployment

### Production Setup
1. Place input files in `data/` directory
2. Output files will be created in `output/` directory
3. Use environment variables for configuration

### Docker Support
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY scripts/ .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "convert_shopee_data.py"]
```

## Error Handling
- Validates JSON format
- Handles missing fields gracefully
- Logs conversion statistics
- Exits with proper error codes

## Performance
- Processes large datasets efficiently
- Memory-optimized for production use
- Supports batch processing
