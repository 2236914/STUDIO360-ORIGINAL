-- ============================================
-- PRODUCT FORECASTING SQL FUNCTIONS (FIXED)
-- ============================================

-- 1. Get Product Sales Data for Forecasting (FIXED)
CREATE OR REPLACE FUNCTION get_product_sales_for_forecast(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    product_category TEXT,
    monthly_sales DECIMAL[],
    total_sales DECIMAL,
    avg_monthly_sales DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_sales AS (
        SELECT 
            oi.product_id,
            oi.product_name,
            oi.product_sku,
            ip.category as product_category,
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
    sales_array AS (
        SELECT 
            ms.product_id,
            ms.product_name,
            ms.product_sku,
            ms.product_category,
            ARRAY[
                COALESCE(SUM(CASE WHEN ms.month_num = 1 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 2 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 3 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 4 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 5 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 6 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 7 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 8 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 9 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 10 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 11 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 12 THEN ms.monthly_total END), 0)
            ] as monthly_sales,
            SUM(ms.monthly_total) as total_sales
        FROM monthly_sales ms
        GROUP BY ms.product_id, ms.product_name, ms.product_sku, ms.product_category
    )
    SELECT 
        sa.product_id,
        sa.product_name,
        sa.product_sku,
        sa.product_category,
        sa.monthly_sales,
        sa.total_sales,
        ROUND(sa.total_sales / 12, 2) as avg_monthly_sales
    FROM sales_array sa
    WHERE sa.total_sales > 0
    ORDER BY sa.total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Category Sales Data for Forecasting (FIXED)
CREATE OR REPLACE FUNCTION get_category_sales_for_forecast(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    category_name TEXT,
    monthly_sales DECIMAL[],
    total_sales DECIMAL,
    product_count BIGINT,
    avg_monthly_sales DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_sales AS (
        SELECT 
            COALESCE(ip.category, 'Uncategorized') as category_name,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.total) as monthly_total
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN inventory_products ip ON oi.product_id = ip.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
        GROUP BY COALESCE(ip.category, 'Uncategorized'), EXTRACT(MONTH FROM o.order_date)
    ),
    sales_array AS (
        SELECT 
            ms.category_name,
            ARRAY[
                COALESCE(SUM(CASE WHEN ms.month_num = 1 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 2 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 3 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 4 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 5 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 6 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 7 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 8 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 9 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 10 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 11 THEN ms.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN ms.month_num = 12 THEN ms.monthly_total END), 0)
            ] as monthly_sales,
            SUM(ms.monthly_total) as total_sales,
            COUNT(DISTINCT oi.product_id) as product_count
        FROM monthly_sales ms
        LEFT JOIN order_items oi ON ms.category_name = COALESCE(
            (SELECT category FROM inventory_products WHERE id = oi.product_id), 'Uncategorized'
        )
        GROUP BY ms.category_name
    )
    SELECT 
        sa.category_name,
        sa.monthly_sales,
        sa.total_sales,
        sa.product_count,
        ROUND(sa.total_sales / 12, 2) as avg_monthly_sales
    FROM sales_array sa
    WHERE sa.total_sales > 0
    ORDER BY sa.total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Get Inventory Forecast Data (FIXED)
CREATE OR REPLACE FUNCTION get_inventory_forecast_data(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_sku TEXT,
    current_stock INTEGER,
    low_stock_threshold INTEGER,
    monthly_demand DECIMAL[],
    avg_monthly_demand DECIMAL,
    total_demand DECIMAL,
    stock_status TEXT,
    days_supply INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_demand AS (
        SELECT 
            oi.product_id,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.quantity) as monthly_qty
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
            AND oi.product_id IS NOT NULL
        GROUP BY oi.product_id, EXTRACT(MONTH FROM o.order_date)
    ),
    demand_array AS (
        SELECT 
            md.product_id,
            ARRAY[
                COALESCE(SUM(CASE WHEN md.month_num = 1 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 2 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 3 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 4 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 5 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 6 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 7 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 8 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 9 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 10 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 11 THEN md.monthly_qty END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 12 THEN md.monthly_qty END), 0)
            ] as monthly_demand,
            SUM(md.monthly_qty) as total_demand
        FROM monthly_demand md
        GROUP BY md.product_id
    )
    SELECT 
        ip.id as product_id,
        ip.name as product_name,
        ip.sku as product_sku,
        ip.stock_quantity as current_stock,
        ip.low_stock_threshold,
        COALESCE(da.monthly_demand, ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]) as monthly_demand,
        ROUND(COALESCE(da.total_demand, 0) / 12, 2) as avg_monthly_demand,
        COALESCE(da.total_demand, 0) as total_demand,
        ip.stock_status,
        CASE 
            WHEN COALESCE(da.total_demand, 0) > 0 THEN 
                ROUND((ip.stock_quantity::DECIMAL / (da.total_demand / 12)) * 30)
            ELSE 999
        END as days_supply
    FROM inventory_products ip
    LEFT JOIN demand_array da ON ip.id = da.product_id
    WHERE ip.user_id = p_user_id
        AND ip.status = 'active'
        AND ip.deleted_at IS NULL
    ORDER BY COALESCE(da.total_demand, 0) DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Get Top Products by Sales (for forecasting) (FIXED)
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
BEGIN
    RETURN QUERY
    WITH product_sales AS (
        SELECT * FROM get_product_sales_for_forecast(p_user_id, p_year)
    ),
    growth_calc AS (
        SELECT 
            ps.*,
            CASE 
                WHEN (ps.monthly_sales[1] + ps.monthly_sales[2] + ps.monthly_sales[3] + 
                      ps.monthly_sales[4] + ps.monthly_sales[5] + ps.monthly_sales[6]) > 0
                THEN ROUND(
                    ((ps.monthly_sales[7] + ps.monthly_sales[8] + ps.monthly_sales[9] + 
                      ps.monthly_sales[10] + ps.monthly_sales[11] + ps.monthly_sales[12]) - 
                     (ps.monthly_sales[1] + ps.monthly_sales[2] + ps.monthly_sales[3] + 
                      ps.monthly_sales[4] + ps.monthly_sales[5] + ps.monthly_sales[6])) * 100.0 / 
                    (ps.monthly_sales[1] + ps.monthly_sales[2] + ps.monthly_sales[3] + 
                     ps.monthly_sales[4] + ps.monthly_sales[5] + ps.monthly_sales[6]), 2
                )
                ELSE 0
            END as growth_rate,
            CASE 
                WHEN (ps.monthly_sales[10] + ps.monthly_sales[11] + ps.monthly_sales[12]) > 
                     (ps.total_sales / 12) * 4
                THEN 'High Season: Q4'
                WHEN (ps.monthly_sales[6] + ps.monthly_sales[7] + ps.monthly_sales[8]) > 
                     (ps.total_sales / 12) * 3
                THEN 'Peak: Summer'
                ELSE 'Steady Year-Round'
            END as seasonality
        FROM product_sales ps
    )
    SELECT 
        gc.product_id,
        gc.product_name,
        gc.product_sku,
        gc.product_category,
        gc.total_sales,
        gc.monthly_sales,
        gc.growth_rate,
        gc.seasonality
    FROM growth_calc gc
    ORDER BY gc.total_sales DESC
    LIMIT p_limit;
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
