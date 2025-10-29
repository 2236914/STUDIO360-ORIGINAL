-- ============================================
-- PRODUCT FORECASTING SQL FUNCTIONS (FIXED)
-- ============================================

-- 1. Get Top Products for Forecasting (Simplified)
CREATE OR REPLACE FUNCTION get_top_products_for_forecast(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    product_category TEXT,
    total_sales DECIMAL,
    monthly_sales DECIMAL[],
    growth_rate DECIMAL,
    seasonality TEXT
) AS $$
DECLARE
    sales_array DECIMAL[];
    total_amount DECIMAL := 0;
    q1_sales DECIMAL := 0;
    q4_sales DECIMAL := 0;
    growth DECIMAL := 0;
    seasonality_text TEXT := 'Steady Year-Round';
BEGIN
    RETURN QUERY
    WITH product_sales AS (
        SELECT 
            oi.product_id,
            oi.product_name,
            oi.product_sku,
            COALESCE(ip.category, 'Uncategorized') as product_category,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.total) as monthly_total
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN inventory_products ip ON oi.product_id = ip.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
            AND oi.product_id IS NOT NULL
        GROUP BY oi.product_id, oi.product_name, oi.product_sku, ip.category, EXTRACT(MONTH FROM o.order_date)
    ),
    aggregated_sales AS (
        SELECT 
            ps.product_id,
            ps.product_name,
            ps.product_sku,
            ps.product_category,
            ARRAY[
                COALESCE(SUM(CASE WHEN ps.month_num = 1 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 2 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 3 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 4 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 5 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 6 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 7 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 8 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 9 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 10 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 11 THEN ps.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ps.month_num = 12 THEN ps.monthly_total END), 0)
            ] as monthly_sales,
            SUM(ps.monthly_total) as total_sales
        FROM product_sales ps
        GROUP BY ps.product_id, ps.product_name, ps.product_sku, ps.product_category
    )
    SELECT 
        as_data.product_id,
        as_data.product_name,
        as_data.product_sku,
        as_data.product_category,
        as_data.total_sales,
        as_data.monthly_sales,
        -- Calculate growth rate (Q4 vs Q1)
        CASE 
            WHEN (as_data.monthly_sales[1] + as_data.monthly_sales[2] + as_data.monthly_sales[3]) > 0
            THEN ROUND(
                ((as_data.monthly_sales[10] + as_data.monthly_sales[11] + as_data.monthly_sales[12]) - 
                 (as_data.monthly_sales[1] + as_data.monthly_sales[2] + as_data.monthly_sales[3])) * 100.0 / 
                (as_data.monthly_sales[1] + as_data.monthly_sales[2] + as_data.monthly_sales[3]), 2
            )
            ELSE 0
        END as growth_rate,
        -- Determine seasonality
        CASE 
            WHEN (as_data.monthly_sales[10] + as_data.monthly_sales[11] + as_data.monthly_sales[12]) > 
                 (as_data.total_sales / 12) * 4
            THEN 'High Season: Q4'
            WHEN (as_data.monthly_sales[6] + as_data.monthly_sales[7] + as_data.monthly_sales[8]) > 
                 (as_data.total_sales / 12) * 3
            THEN 'Peak: Summer'
            ELSE 'Steady Year-Round'
        END as seasonality
    FROM aggregated_sales as_data
    WHERE as_data.total_sales > 0
    ORDER BY as_data.total_sales DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Category Sales for Forecasting
CREATE OR REPLACE FUNCTION get_category_sales_for_forecast(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    category_name TEXT,
    total_sales DECIMAL,
    monthly_sales DECIMAL[],
    growth_rate DECIMAL,
    seasonality TEXT,
    product_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH category_sales AS (
        SELECT 
            COALESCE(ip.category, 'Uncategorized') as category_name,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.total) as monthly_total,
            COUNT(DISTINCT oi.product_id) as product_count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN inventory_products ip ON oi.product_id = ip.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
        GROUP BY ip.category, EXTRACT(MONTH FROM o.order_date)
    ),
    aggregated_categories AS (
        SELECT 
            cs.category_name,
            ARRAY[
                COALESCE(SUM(CASE WHEN cs.month_num = 1 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 2 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 3 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 4 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 5 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 6 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 7 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 8 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 9 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 10 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 11 THEN cs.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN cs.month_num = 12 THEN cs.monthly_total END), 0)
            ] as monthly_sales,
            SUM(cs.monthly_total) as total_sales,
            MAX(cs.product_count) as product_count
        FROM category_sales cs
        GROUP BY cs.category_name
    )
    SELECT 
        ac.category_name,
        ac.total_sales,
        ac.monthly_sales,
        -- Calculate growth rate (Q4 vs Q1)
        CASE 
            WHEN (ac.monthly_sales[1] + ac.monthly_sales[2] + ac.monthly_sales[3]) > 0
            THEN ROUND(
                ((ac.monthly_sales[10] + ac.monthly_sales[11] + ac.monthly_sales[12]) - 
                 (ac.monthly_sales[1] + ac.monthly_sales[2] + ac.monthly_sales[3])) * 100.0 / 
                (ac.monthly_sales[1] + ac.monthly_sales[2] + ac.monthly_sales[3]), 2
            )
            ELSE 0
        END as growth_rate,
        -- Determine seasonality
        CASE 
            WHEN (ac.monthly_sales[10] + ac.monthly_sales[11] + ac.monthly_sales[12]) > 
                 (ac.total_sales / 12) * 4
            THEN 'High Season: Q4'
            WHEN (ac.monthly_sales[6] + ac.monthly_sales[7] + ac.monthly_sales[8]) > 
                 (ac.total_sales / 12) * 3
            THEN 'Peak: Summer'
            ELSE 'Steady Year-Round'
        END as seasonality,
        ac.product_count
    FROM aggregated_categories ac
    WHERE ac.total_sales > 0
    ORDER BY ac.total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Get Inventory Forecast Data
CREATE OR REPLACE FUNCTION get_inventory_forecast_data(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    current_stock INTEGER,
    monthly_demand DECIMAL[],
    avg_monthly_demand DECIMAL,
    reorder_point INTEGER,
    stock_status TEXT,
    forecast_category TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH product_demand AS (
        SELECT 
            oi.product_id,
            oi.product_name,
            oi.product_sku,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.quantity) as monthly_demand
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
            AND oi.product_id IS NOT NULL
        GROUP BY oi.product_id, oi.product_name, oi.product_sku, EXTRACT(MONTH FROM o.order_date)
    ),
    aggregated_demand AS (
        SELECT 
            pd.product_id,
            pd.product_name,
            pd.product_sku,
            ARRAY[
                COALESCE(SUM(CASE WHEN pd.month_num = 1 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 2 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 3 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 4 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 5 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 6 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 7 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 8 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 9 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 10 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 11 THEN pd.monthly_demand END), 0),
                COALESCE(SUM(CASE WHEN pd.month_num = 12 THEN pd.monthly_demand END), 0)
            ] as monthly_demand,
            SUM(pd.monthly_demand) as total_demand
        FROM product_demand pd
        GROUP BY pd.product_id, pd.product_name, pd.product_sku
    )
    SELECT 
        ad.product_id,
        ad.product_name,
        ad.product_sku,
        COALESCE(ip.stock_quantity, 0) as current_stock,
        ad.monthly_demand,
        ROUND(ad.total_demand / 12, 2) as avg_monthly_demand,
        -- Calculate reorder point (2 months of average demand)
        GREATEST(ROUND(ad.total_demand / 12 * 2), 10) as reorder_point,
        -- Determine stock status
        CASE 
            WHEN COALESCE(ip.stock_quantity, 0) <= 0 THEN 'Out of Stock'
            WHEN COALESCE(ip.stock_quantity, 0) <= ROUND(ad.total_demand / 12 * 2) THEN 'Low Stock'
            WHEN COALESCE(ip.stock_quantity, 0) <= ROUND(ad.total_demand / 12 * 4) THEN 'Medium Stock'
            ELSE 'High Stock'
        END as stock_status,
        -- Forecast category based on demand pattern
        CASE 
            WHEN ad.total_demand > 1000 THEN 'High Demand'
            WHEN ad.total_demand > 500 THEN 'Medium Demand'
            WHEN ad.total_demand > 100 THEN 'Low Demand'
            ELSE 'Very Low Demand'
        END as forecast_category
    FROM aggregated_demand ad
    LEFT JOIN inventory_products ip ON ad.product_id = ip.id
    WHERE ad.total_demand > 0
    ORDER BY ad.total_demand DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TEST THE FUNCTIONS
-- ============================================

-- Test top products forecast
SELECT 'Testing Top Products Forecast:' as test_name;
SELECT * FROM get_top_products_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025, 5);

-- Test category sales forecast
SELECT 'Testing Category Sales Forecast:' as test_name;
SELECT * FROM get_category_sales_for_forecast('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- Test inventory forecast
SELECT 'Testing Inventory Forecast:' as test_name;
SELECT * FROM get_inventory_forecast_data('00000000-0000-0000-0000-000000000000'::uuid, 2025);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Product Forecasting SQL Functions Created Successfully!' as status;
