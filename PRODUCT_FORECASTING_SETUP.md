# Product Forecasting SQL Setup

This guide explains how to set up the SQL functions needed for Prophet-based product forecasting.

## 📋 Prerequisites

- Supabase database connection
- PostgreSQL database with the following tables:
  - `orders` (from 2025-01-22_orders.sql)
  - `order_items` (from 2025-01-22_orders.sql)
  - `inventory_products` (from 2025-01-22_inventory.sql)
  - `user_model` (from 2025-01-20_user_model.sql)

## 🚀 Setup Steps

### 1. Run the Migration

Execute the SQL migration file:

```sql
-- Run this in your Supabase SQL editor or psql
\i database/migrations/2025-01-22_product_forecasting.sql
```

### 2. Test the Functions

Replace `'your-user-id'` with your actual user ID:

```sql
-- Test product sales function
SELECT * FROM get_product_sales_for_forecast('your-user-id'::uuid, 2025);

-- Test category sales function  
SELECT * FROM get_category_sales_for_forecast('your-user-id'::uuid, 2025);

-- Test inventory forecast function
SELECT * FROM get_inventory_forecast_data('your-user-id'::uuid, 2025);

-- Test top products function
SELECT * FROM get_top_products_for_forecast('your-user-id'::uuid, 2025, 5);
```

### 3. Update Backend Configuration

In `backend/api/analytics/analytics.routes.js`, update the user ID:

```javascript
// Line 241: Replace with actual user ID
const userId = 'your-actual-user-id'; // Replace this
```

### 4. Sample Data (Optional)

If you don't have order data yet, you can insert sample data:

```sql
-- Run the setup script
\i setup-product-forecasting.sql
```

## 📊 SQL Functions Created

### 1. `get_product_sales_for_forecast(user_id, year)`
Returns monthly sales data for each product:
- `product_id`, `product_name`, `product_sku`, `product_category`
- `monthly_sales` (array of 12 months)
- `total_sales`, `avg_monthly_sales`

### 2. `get_category_sales_for_forecast(user_id, year)`
Returns monthly sales data by category:
- `category_name`
- `monthly_sales` (array of 12 months)
- `total_sales`, `product_count`, `avg_monthly_sales`

### 3. `get_inventory_forecast_data(user_id, year)`
Returns inventory and demand data:
- Product details and current stock
- `monthly_demand` (array of 12 months)
- `avg_monthly_demand`, `total_demand`
- `days_supply` calculation

### 4. `get_top_products_for_forecast(user_id, year, limit)`
Returns top products with forecasting metrics:
- All product details
- `growth_rate` calculation
- `seasonality` detection

## 🔧 Backend Integration

The backend API automatically:

1. **Calls SQL functions** to get real product data
2. **Uses Prophet** to generate 3-month forecasts
3. **Falls back gracefully** if Prophet/Python not available
4. **Calculates confidence** based on data quality

## 📈 Data Flow

```
Database (orders, order_items) 
    ↓
SQL Functions (get_top_products_for_forecast)
    ↓
Backend API (analytics.routes.js)
    ↓
Prophet Python Script (forecast_sales.py)
    ↓
Frontend (AnalyticsProductPerformance)
```

## 🎯 Benefits

✅ **Real Data** - Uses actual order and sales data  
✅ **Prophet AI** - Advanced time series forecasting  
✅ **Performance** - Optimized SQL with indexes  
✅ **Scalable** - Handles large datasets efficiently  
✅ **Flexible** - Easy to modify and extend  

## 🚨 Troubleshooting

### No Data Returned
- Check if you have orders in the `orders` table
- Verify the user_id is correct
- Ensure orders have `status = 'completed'`

### Performance Issues
- The indexes are automatically created
- For large datasets, consider adding more specific indexes

### Prophet Not Working
- The system falls back to intelligent algorithms
- Install Python and Prophet: `pip install prophet pandas`

## 📝 Next Steps

1. Run the migration
2. Test with sample data
3. Update user ID in backend
4. Verify forecasting works in dashboard
5. Add more products/orders for better forecasts

Your product forecasting will now use real data and Prophet AI! 🎉
