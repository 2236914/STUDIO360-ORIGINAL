-- Updated import function that APPENDS data instead of replacing
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
    data_year INTEGER;
    data_month INTEGER;
    import_date_value DATE;
BEGIN
    -- REMOVED: DELETE FROM shopee_analytics WHERE user_id = p_user_id;
    -- Now it will APPEND data instead of replacing
    
    -- Loop through each product
    FOR product_record IN SELECT * FROM jsonb_array_elements(p_shopee_data)
    LOOP
        -- Extract year and month from JSON data
        data_year := COALESCE((product_record->>'year')::INTEGER, 2024);
        data_month := COALESCE((product_record->>'month')::INTEGER, 1);
        
        -- Create proper import_date based on data year/month
        import_date_value := DATE(data_year || '-' || LPAD(data_month::TEXT, 2, '0') || '-15');
        
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
            import_date_value
        );
        
        total_products := total_products + 1;
        total_sales_amount := total_sales_amount + COALESCE((product_record->'metrics'->>'sales_amount')::DECIMAL, 0);
        total_units_count := total_units_count + COALESCE((product_record->'metrics'->>'confirmed_units')::INTEGER, 0);
    END LOOP;
    
    RETURN QUERY SELECT total_products, total_sales_amount, total_units_count;
END;
$$ LANGUAGE plpgsql;