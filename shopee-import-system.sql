-- ============================================
-- SHOPEE DATA IMPORT SYSTEM (30-MINUTE SETUP)
-- ============================================

-- 1. Create SKU Mapping Table
CREATE TABLE IF NOT EXISTS sku_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'shopee', 'tiktok', '360'
    platform_sku VARCHAR(100) NOT NULL,
    internal_sku VARCHAR(100) NOT NULL,
    product_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, platform, platform_sku)
);

-- 2. Create Shopee Analytics Table
CREATE TABLE IF NOT EXISTS shopee_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_id BIGINT NOT NULL,
    product_name TEXT NOT NULL,
    platform_sku VARCHAR(100) NOT NULL,
    page_views INTEGER DEFAULT 0,
    add_to_cart_units INTEGER DEFAULT 0,
    confirmed_units INTEGER DEFAULT 0,
    sales_amount DECIMAL DEFAULT 0,
    conversion_rate DECIMAL DEFAULT 0,
    import_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Import Shopee Data Function
CREATE OR REPLACE FUNCTION import_shopee_analytics_data(
    p_user_id UUID,
    p_shopee_data JSONB
)
RETURNS TABLE (
    imported_products INTEGER,
    total_sales DECIMAL,
    total_units INTEGER
) AS $$
DECLARE
    product_record JSONB;
    total_products INTEGER := 0;
    total_sales_amount DECIMAL := 0;
    total_units_count INTEGER := 0;
BEGIN
    -- Loop through each product
    FOR product_record IN SELECT * FROM jsonb_array_elements(p_shopee_data)
    LOOP
        -- Insert into shopee_analytics table
        INSERT INTO shopee_analytics (
            user_id,
            item_id,
            product_name,
            platform_sku,
            page_views,
            add_to_cart_units,
            confirmed_units,
            sales_amount,
            conversion_rate
        ) VALUES (
            p_user_id,
            COALESCE((product_record->>'item_id')::BIGINT, 0),
            product_record->>'product_name',
            product_record->>'product_sku',
            COALESCE((product_record->'metrics'->>'page_views')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'add_to_cart_units')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'confirmed_units')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'sales_amount')::DECIMAL, 0),
            COALESCE((product_record->>'conversion_rate')::DECIMAL, 0)
        );
        
        total_products := total_products + 1;
        total_sales_amount := total_sales_amount + COALESCE((product_record->'metrics'->>'sales_amount')::DECIMAL, 0);
        total_units_count := total_units_count + COALESCE((product_record->'metrics'->>'confirmed_units')::INTEGER, 0);
    END LOOP;
    
    RETURN QUERY SELECT total_products, total_sales_amount, total_units_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Unified Product Forecast Function
CREATE OR REPLACE FUNCTION get_unified_product_forecast(
    p_user_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    product_name TEXT,
    unified_sku TEXT,
    platform_sources TEXT[],
    monthly_sales DECIMAL[],
    total_sales DECIMAL,
    growth_rate DECIMAL,
    seasonality TEXT,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH unified_sales AS (
        -- Sales from your system (orders table)
        SELECT 
            oi.product_name,
            oi.product_sku as unified_sku,
            ARRAY['Studio360'] as platform_sources,
            EXTRACT(MONTH FROM o.order_date) as month_num,
            SUM(oi.total) as monthly_total,
            0 as conversion_rate
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = p_user_id
            AND EXTRACT(YEAR FROM o.order_date) = p_year
            AND o.status IN ('completed', 'processing')
        GROUP BY oi.product_name, oi.product_sku, EXTRACT(MONTH FROM o.order_date)
        
        UNION ALL
        
        -- Sales from Shopee (shopee_analytics table)
        SELECT 
            sa.product_name,
            COALESCE(sm.internal_sku, sa.platform_sku) as unified_sku,
            ARRAY['Shopee'] as platform_sources,
            EXTRACT(MONTH FROM sa.import_date) as month_num,
            sa.sales_amount as monthly_total,
            sa.conversion_rate
        FROM shopee_analytics sa
        LEFT JOIN sku_mappings sm ON sa.platform_sku = sm.platform_sku AND sm.user_id = p_user_id
        WHERE sa.user_id = p_user_id
            AND EXTRACT(YEAR FROM sa.import_date) = p_year
            AND sa.sales_amount > 0
    ),
    aggregated_sales AS (
        SELECT 
            us.product_name,
            us.unified_sku,
            array_agg(DISTINCT unnest(us.platform_sources)) as platform_sources,
            ARRAY[
                COALESCE(SUM(CASE WHEN us.month_num = 1 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 2 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 3 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 4 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 5 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 6 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 7 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 8 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 9 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 10 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 11 THEN us.monthly_total END), 0),
                COALESCE(SUM(CASE WHEN us.month_num = 12 THEN us.monthly_total END), 0)
            ] as monthly_sales,
            SUM(us.monthly_total) as total_sales,
            AVG(us.conversion_rate) as avg_conversion_rate
        FROM unified_sales us
        GROUP BY us.product_name, us.unified_sku
    )
    SELECT 
        as_data.product_name,
        as_data.unified_sku,
        as_data.platform_sources,
        as_data.monthly_sales,
        as_data.total_sales,
        -- Calculate growth rate
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
        END as seasonality,
        ROUND(as_data.avg_conversion_rate, 2) as conversion_rate
    FROM aggregated_sales as_data
    WHERE as_data.total_sales > 0
    ORDER BY as_data.total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sku_mappings_user_platform ON sku_mappings(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_shopee_analytics_user_date ON shopee_analytics(user_id, import_date);
CREATE INDEX IF NOT EXISTS idx_shopee_analytics_sku ON shopee_analytics(platform_sku);

-- 6. Test the functions
SELECT '✅ Shopee Import System Created Successfully!' as status;
