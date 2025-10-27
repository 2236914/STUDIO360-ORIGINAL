# 📊 Historical Data Import Guide

This guide shows you how to connect your past sales data to the Prophet forecasting system.

## 🎯 Data Import Options

### **Option 1: Excel/CSV Upload (Easiest)**

#### **For Sales Data:**
1. **Prepare your Excel/CSV file** with columns:
   - `date` (YYYY-MM-DD)
   - `invoice_no` 
   - `source` (Shopee, TikTok, 360, etc.)
   - `total_revenue`
   - `fees`
   - `cash_received`

2. **Use existing upload endpoint:**
   ```
   POST /api/ai/sales-ingest
   ```
   - Upload your Excel file
   - System automatically detects platform (Shopee/TikTok)
   - Converts to normalized format
   - Posts to cash_receipt_journal

#### **Example Excel Format:**
```
Date        | Invoice No | Source | Total Revenue | Fees | Cash Received
2024-01-15  | INV-001    | Shopee | 1000.00      | 50.00| 950.00
2024-01-16  | INV-002    | TikTok | 800.00       | 40.00| 760.00
```

### **Option 2: JSON API Import (Most Flexible)**

#### **Import Sales Data:**
```javascript
// POST /api/analytics/import/historical-sales
{
  "sales": [
    {
      "date": "2024-01-15",
      "invoice_no": "INV-001",
      "source": "Shopee",
      "reference": "REF-001",
      "total_revenue": 1000.00,
      "fees": 50.00,
      "cash_received": 950.00,
      "remarks": "Historical import"
    }
  ]
}
```

#### **Import Orders with Products:**
```javascript
// POST /api/analytics/import/historical-orders
{
  "orders": [
    {
      "order_number": "ORD-001",
      "order_date": "2024-01-15",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "status": "completed",
      "subtotal": 100.00,
      "total": 100.00,
      "items": [
        {
          "product_name": "Wireless Headphones",
          "product_sku": "WH-001",
          "unit_price": 50.00,
          "quantity": 2,
          "subtotal": 100.00,
          "total": 100.00
        }
      ]
    }
  ]
}
```

#### **Import Product Inventory:**
```javascript
// POST /api/analytics/import/historical-products
{
  "products": [
    {
      "name": "Wireless Headphones",
      "sku": "WH-001",
      "category": "Electronics",
      "price": 50.00,
      "cost": 25.00,
      "stock_quantity": 100,
      "low_stock_threshold": 10,
      "stock_status": "in stock",
      "description": "High-quality wireless headphones"
    }
  ]
}
```

### **Option 3: CSV Bulk Import**

#### **For Large Datasets:**
```javascript
// POST /api/analytics/import/csv-sales
{
  "csvData": "date,invoice_no,source,total_revenue,fees,cash_received\n2024-01-15,INV-001,Shopee,1000.00,50.00,950.00\n2024-01-16,INV-002,TikTok,800.00,40.00,760.00"
}
```

## 🚀 Step-by-Step Import Process

### **Step 1: Set Up SQL Functions**
```sql
-- Run the migration
\i database/migrations/2025-01-22_historical_data_import.sql
```

### **Step 2: Choose Your Data Format**

#### **If you have Excel files:**
1. Use the existing `/api/ai/sales-ingest` endpoint
2. Upload your Excel file
3. System automatically processes it

#### **If you have JSON/API data:**
1. Use the new import endpoints
2. Format your data according to templates
3. Send POST requests

#### **If you have CSV data:**
1. Use the CSV import endpoint
2. Format: `date,invoice_no,source,total_revenue,fees,cash_received`

### **Step 3: Import Your Data**

#### **Using curl:**
```bash
# Import sales data
curl -X POST http://localhost:3001/api/analytics/import/historical-sales \
  -H "Content-Type: application/json" \
  -d '{
    "sales": [
      {
        "date": "2024-01-15",
        "invoice_no": "INV-001",
        "source": "Shopee",
        "total_revenue": 1000.00,
        "fees": 50.00,
        "cash_received": 950.00
      }
    ]
  }'
```

#### **Using JavaScript:**
```javascript
const response = await fetch('/api/analytics/import/historical-sales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sales: yourHistoricalSalesData
  })
});

const result = await response.json();
console.log('Imported:', result.data.imported);
```

### **Step 4: Verify Import**

#### **Check imported data:**
```sql
-- Check sales data
SELECT COUNT(*) FROM cash_receipt_journal WHERE remarks = 'Historical import';

-- Check orders
SELECT COUNT(*) FROM orders WHERE order_number LIKE 'HIST-%';

-- Check products
SELECT COUNT(*) FROM inventory_products WHERE created_at > NOW() - INTERVAL '1 hour';
```

#### **Test forecasting:**
```sql
-- Test product forecasting
SELECT * FROM get_top_products_for_forecast('your-user-id'::uuid, 2024, 5);
```

## 📋 Data Format Examples

### **Shopee Sales Data:**
```json
{
  "sales": [
    {
      "date": "2024-01-15",
      "invoice_no": "SP-001",
      "source": "Shopee",
      "total_revenue": 1000.00,
      "fees": 50.00,
      "cash_received": 950.00,
      "remarks": "Shopee sale"
    }
  ]
}
```

### **TikTok Sales Data:**
```json
{
  "sales": [
    {
      "date": "2024-01-15",
      "invoice_no": "TT-001",
      "source": "TikTok",
      "total_revenue": 800.00,
      "fees": 40.00,
      "cash_received": 760.00,
      "remarks": "TikTok sale"
    }
  ]
}
```

### **Complete Order with Products:**
```json
{
  "orders": [
    {
      "order_number": "ORD-001",
      "order_date": "2024-01-15",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "status": "completed",
      "subtotal": 200.00,
      "total": 200.00,
      "items": [
        {
          "product_name": "Wireless Headphones",
          "product_sku": "WH-001",
          "unit_price": 100.00,
          "quantity": 1,
          "subtotal": 100.00,
          "total": 100.00
        },
        {
          "product_name": "Phone Case",
          "product_sku": "PC-001",
          "unit_price": 50.00,
          "quantity": 2,
          "subtotal": 100.00,
          "total": 100.00
        }
      ]
    }
  ]
}
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **Date Format:** Use YYYY-MM-DD format
2. **Decimal Numbers:** Use dot (.) as decimal separator
3. **User ID:** Make sure to use correct user ID
4. **Required Fields:** Include all required fields

### **Error Handling:**
- Import functions return success count and errors
- Check error messages for specific issues
- Partial imports are supported (some records may fail)

### **Performance Tips:**
- Import in batches of 100-500 records
- Use CSV import for large datasets
- Indexes are automatically created

## 🎯 Next Steps

1. **Run the SQL migration**
2. **Choose your import method**
3. **Format your data**
4. **Import historical data**
5. **Test Prophet forecasting**
6. **Verify results in dashboard**

Your historical data will now power the Prophet forecasting system! 🎉

## 📞 Support

If you need help with data formatting or import issues:
1. Check the template endpoint: `GET /api/analytics/import/template`
2. Review error messages in import responses
3. Test with small datasets first
4. Use the existing sales-ingest endpoint for Excel files
