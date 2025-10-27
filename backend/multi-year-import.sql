-- Multi-year Shopee data import script
-- Run this in Supabase SQL Editor

-- Function to import Shopee data for a specific year
CREATE OR REPLACE FUNCTION import_shopee_analytics_by_year(
    p_user_id UUID,
    p_shopee_data JSONB,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    imported_products INTEGER,
    total_sales DECIMAL,
    total_units INTEGER,
    year_processed INTEGER
) AS $$
DECLARE
    product_record JSONB;
    total_products INTEGER := 0;
    total_sales_amount DECIMAL := 0;
    total_units_count INTEGER := 0;
BEGIN
    -- Clear existing data for this year (optional - comment out if you want to keep all data)
    -- DELETE FROM shopee_analytics WHERE user_id = p_user_id AND EXTRACT(YEAR FROM import_date) = p_year;
    
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
            conversion_rate,
            import_date
        ) VALUES (
            p_user_id,
            COALESCE((product_record->>'item_id')::BIGINT, 0),
            product_record->>'product_name',
            product_record->>'product_sku',
            COALESCE((product_record->'metrics'->>'page_views')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'add_to_cart_units')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'confirmed_units')::INTEGER, 0),
            COALESCE((product_record->'metrics'->>'sales_amount')::DECIMAL, 0),
            COALESCE((product_record->>'conversion_rate')::DECIMAL, 0),
            DATE(p_year || '-01-01') -- Set import date to January 1st of the year
        );
        
        total_products := total_products + 1;
        total_sales_amount := total_sales_amount + COALESCE((product_record->'metrics'->>'sales_amount')::DECIMAL, 0);
        total_units_count := total_units_count + COALESCE((product_record->'metrics'->>'confirmed_units')::INTEGER, 0);
    END LOOP;
    
    RETURN QUERY SELECT total_products, total_sales_amount, total_units_count, p_year;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT '✅ Multi-year import function created successfully!' as status;

-- Example usage (replace with your actual data):
-- SELECT * FROM import_shopee_analytics_by_year(
--     'bf9df707-b8dc-4351-ae67-95c2c5b6e01c'::UUID,
--     'YOUR_2024_JSON_DATA_HERE'::JSONB,
--     2024
-- );

-- SELECT * FROM import_shopee_analytics_by_year(
--     'bf9df707-b8dc-4351-ae67-95c2c5b6e01c'::UUID,
--     'YOUR_2025_JSON_DATA_HERE'::JSONB,
--     2025
-- );
