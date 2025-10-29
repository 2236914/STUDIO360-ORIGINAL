-- Test if the unified function exists and create a simple version if needed
-- Run this in Supabase SQL Editor

-- First, check if the function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_unified_product_forecast';

-- If it doesn't exist, create a simple version
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
    SELECT 
        sa.product_name,
        sa.platform_sku as unified_sku,
        ARRAY['Shopee'] as platform_sources,
        ARRAY[
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0),
            COALESCE(sa.sales_amount / 12, 0)
        ] as monthly_sales,
        sa.sales_amount as total_sales,
        0.0 as growth_rate,
        'Steady Year-Round' as seasonality,
        sa.conversion_rate
    FROM shopee_analytics sa
    WHERE sa.user_id = p_user_id
        AND sa.sales_amount > 0
    ORDER BY sa.sales_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT * FROM get_unified_product_forecast('bf9df707-b8dc-4351-ae67-95c2c5b6e01c'::UUID, 2025);
