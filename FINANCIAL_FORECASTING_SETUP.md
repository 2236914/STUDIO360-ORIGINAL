# Financial Forecasting Setup Guide

## Overview
This guide explains how to set up financial forecasting for sales and expenses using the new SQL functions.

## What's Included

### 1. SQL Functions Created
- `get_monthly_sales_for_forecast(year)` - Monthly sales data by channel
- `get_monthly_expenses_for_forecast(year)` - Monthly expenses by category  
- `get_sales_forecast_data(year)` - Complete sales forecast with growth metrics
- `get_expenses_forecast_data(year)` - Complete expenses forecast with growth metrics
- `get_financial_forecast_data(year)` - Combined sales + expenses + profit analysis

### 2. Data Sources
- **Sales Data**: `cash_receipt_journal` table (`cr_sales` column)
- **Expenses Data**: `cash_disbursement_book` table (various expense columns)
- **Channels**: 360, Shopee, TikTok (detected from `source` field)
- **Expense Categories**: Materials, Supplies, Rent, Utilities, Advertising, Delivery, Taxes, Miscellaneous

### 3. Features
- **Monthly Aggregation**: 12 months of historical data
- **Growth Rate Calculation**: Q4 vs Q1 comparison
- **Seasonality Detection**: Identifies peak seasons
- **Channel Breakdown**: Sales by platform/channel
- **Category Breakdown**: Expenses by category
- **Profit Analysis**: Net profit and margin calculations

## Setup Instructions

### Step 1: Run SQL Migration
```sql
\i database/migrations/2025-01-22_financial_forecasting.sql
```

### Step 2: Test Functions
```sql
\i setup-financial-forecasting.sql
```

### Step 3: Verify Data
```sql
-- Check if you have sales data
SELECT COUNT(*) FROM cash_receipt_journal WHERE cr_sales > 0;

-- Check if you have expense data  
SELECT COUNT(*) FROM cash_disbursement_book 
WHERE dr_rent > 0 OR dr_utilities > 0 OR dr_advertising > 0;
```

## API Integration

### Backend Endpoints Needed
The frontend Finance Forecast chart expects these endpoints:

1. **Sales Data**: `GET /api/analytics/sales?year=2025`
2. **Expenses Data**: `GET /api/analytics/expenses?year=2025` (to be created)
3. **Combined Forecast**: `POST /api/analytics/financial-forecast` (to be created)

### Sample API Response Format
```json
{
  "success": true,
  "data": {
    "year": 2025,
    "sales": {
      "monthly_sales": [5000, 6000, 7000, ...],
      "total_sales": 72000,
      "growth_rate": 15.5,
      "seasonality": "High Season: Q4"
    },
    "expenses": {
      "monthly_expenses": [3000, 3200, 3100, ...],
      "total_expenses": 36000,
      "growth_rate": 8.2,
      "seasonality": "Steady Year-Round"
    },
    "profit_margin": 50.0,
    "net_profit": 36000
  }
}
```

## Data Requirements

### Minimum Data Needed
- **Sales**: At least 3 months of sales data in `cash_receipt_journal`
- **Expenses**: At least 3 months of expense data in `cash_disbursement_book`

### Data Quality Tips
1. **Consistent Dates**: Use proper date format (YYYY-MM-DD)
2. **Source Field**: Include channel info (360, Shopee, TikTok) in `source` field
3. **Complete Records**: Ensure `cr_sales` > 0 for sales records
4. **Expense Categories**: Use appropriate expense columns in disbursement book

## Troubleshooting

### No Data Showing
1. Check if tables exist: `SELECT * FROM cash_receipt_journal LIMIT 1;`
2. Check if data exists: `SELECT COUNT(*) FROM cash_receipt_journal WHERE cr_sales > 0;`
3. Check date range: `SELECT MIN(date), MAX(date) FROM cash_receipt_journal;`

### Functions Not Found
1. Verify migration ran: `SELECT * FROM get_sales_forecast_data(2025);`
2. Check permissions: Ensure your user has EXECUTE permissions
3. Check schema: Functions should be in `public` schema

### Performance Issues
1. Check indexes: `\d cash_receipt_journal` and `\d cash_disbursement_book`
2. Analyze queries: `EXPLAIN ANALYZE SELECT * FROM get_financial_forecast_data(2025);`
3. Consider data archiving for very large datasets

## Next Steps

1. **Run the SQL migration** in your Supabase database
2. **Test the functions** with the setup script
3. **Update backend API** to use these functions
4. **Test the Finance Forecast chart** in the frontend

The Finance Forecast chart will now show real data instead of flat lines at zero!
