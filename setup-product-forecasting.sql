-- ============================================
-- PRODUCT FORECASTING SETUP SCRIPT
-- ============================================

-- Run this script to set up product forecasting SQL functions
-- Make sure you're connected to your Supabase database

-- 1. First, run the migration file
-- \i database/migrations/2025-01-22_product_forecasting.sql

-- 2. Test the functions with sample data
-- Replace '00000000-0000-0000-0000-000000000000' with actual user ID

-- Test product sales function
SELECT * FROM get_product_sales_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- Test category sales function  
SELECT * FROM get_category_sales_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- Test inventory forecast function
SELECT * FROM get_inventory_forecast_data('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- Test top products function
SELECT * FROM get_top_products_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025, 5);

-- 3. Sample data insertion (optional - for testing)
-- Insert some sample orders and order items to test the functions

-- Sample order
INSERT INTO orders (
    user_id, order_number, order_date, customer_name, customer_email,
    status, subtotal, total
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, 
    '#TEST001', 
    CURRENT_DATE, 
    'Test Customer', 
    'test@example.com',
    'completed',
    1000.00,
    1000.00
) ON CONFLICT DO NOTHING;

-- Sample order items
INSERT INTO order_items (
    order_id, user_id, product_name, product_sku, unit_price, quantity, subtotal, total
) VALUES (
    (SELECT id FROM orders WHERE order_number = '#TEST001' LIMIT 1),
    '00000000-0000-0000-0000-000000000000'::uuid,
    'Test Product',
    'TEST-001',
    100.00,
    10,
    1000.00,
    1000.00
) ON CONFLICT DO NOTHING;

-- 4. Verify the setup
SELECT 
    'Product Sales Function' as function_name,
    COUNT(*) as result_count
FROM get_product_sales_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025)

UNION ALL

SELECT 
    'Category Sales Function' as function_name,
    COUNT(*) as result_count
FROM get_category_sales_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025)

UNION ALL

SELECT 
    'Inventory Forecast Function' as function_name,
    COUNT(*) as result_count
FROM get_inventory_forecast_data('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- 5. Performance check
EXPLAIN ANALYZE SELECT * FROM get_top_products_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025, 10);
