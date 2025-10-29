-- ============================================
-- HISTORICAL DATA IMPORT SQL FUNCTIONS
-- ============================================

-- 1. Import historical orders from CSV/Excel data
CREATE OR REPLACE FUNCTION import_historical_orders(
    p_user_id UUID,
    p_orders_data JSONB
)
RETURNS TABLE (
    imported_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    order_record JSONB;
    order_id UUID;
    error_list TEXT[] := '{}';
    success_count INTEGER := 0;
BEGIN
    -- Loop through each order in the JSONB array
    FOR order_record IN SELECT * FROM jsonb_array_elements(p_orders_data)
    LOOP
        BEGIN
            -- Insert order
            INSERT INTO orders (
                user_id,
                order_number,
                order_date,
                customer_name,
                customer_email,
                customer_phone,
                status,
                subtotal,
                total,
                created_at
            ) VALUES (
                p_user_id,
                COALESCE(order_record->>'order_number', 'HIST-' || EXTRACT(EPOCH FROM NOW())::TEXT),
                COALESCE((order_record->>'order_date')::DATE, CURRENT_DATE),
                COALESCE(order_record->>'customer_name', 'Historical Customer'),
                COALESCE(order_record->>'customer_email', 'historical@example.com'),
                order_record->>'customer_phone',
                COALESCE(order_record->>'status', 'completed'),
                COALESCE((order_record->>'subtotal')::DECIMAL, 0),
                COALESCE((order_record->>'total')::DECIMAL, 0),
                COALESCE((order_record->>'order_date')::TIMESTAMPTZ, CURRENT_TIMESTAMP)
            ) RETURNING id INTO order_id;

            -- Insert order items if provided
            IF order_record ? 'items' THEN
                INSERT INTO order_items (
                    order_id,
                    user_id,
                    product_name,
                    product_sku,
                    unit_price,
                    quantity,
                    subtotal,
                    total
                ) SELECT 
                    order_id,
                    p_user_id,
                    COALESCE(item->>'product_name', 'Historical Product'),
                    item->>'product_sku',
                    COALESCE((item->>'unit_price')::DECIMAL, 0),
                    COALESCE((item->>'quantity')::INTEGER, 1),
                    COALESCE((item->>'subtotal')::DECIMAL, 0),
                    COALESCE((item->>'total')::DECIMAL, 0)
                FROM jsonb_array_elements(order_record->'items') AS item;
            END IF;

            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 'Order ' || COALESCE(order_record->>'order_number', 'unknown') || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN QUERY SELECT success_count, error_list;
END;
$$ LANGUAGE plpgsql;

-- 2. Import historical sales data directly to cash_receipt_journal
CREATE OR REPLACE FUNCTION import_historical_sales(
    p_user_id UUID,
    p_sales_data JSONB
)
RETURNS TABLE (
    imported_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    sale_record JSONB;
    error_list TEXT[] := '{}';
    success_count INTEGER := 0;
BEGIN
    FOR sale_record IN SELECT * FROM jsonb_array_elements(p_sales_data)
    LOOP
        BEGIN
            INSERT INTO cash_receipt_journal (
                date,
                invoice_no,
                source,
                reference,
                dr_cash,
                dr_fees,
                dr_returns,
                cr_sales,
                cr_income,
                cr_ar,
                remarks
            ) VALUES (
                COALESCE((sale_record->>'date')::DATE, CURRENT_DATE),
                sale_record->>'invoice_no',
                COALESCE(sale_record->>'source', 'Historical'),
                sale_record->>'reference',
                COALESCE((sale_record->>'cash_received')::DECIMAL, 0),
                COALESCE((sale_record->>'fees')::DECIMAL, 0),
                COALESCE((sale_record->>'returns')::DECIMAL, 0),
                COALESCE((sale_record->>'total_revenue')::DECIMAL, 0),
                COALESCE((sale_record->>'other_income')::DECIMAL, 0),
                COALESCE((sale_record->>'accounts_receivable')::DECIMAL, 0),
                COALESCE(sale_record->>'remarks', 'Historical import')
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 'Sale ' || COALESCE(sale_record->>'invoice_no', 'unknown') || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN QUERY SELECT success_count, error_list;
END;
$$ LANGUAGE plpgsql;

-- 3. Import product inventory data
CREATE OR REPLACE FUNCTION import_historical_products(
    p_user_id UUID,
    p_products_data JSONB
)
RETURNS TABLE (
    imported_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    product_record JSONB;
    error_list TEXT[] := '{}';
    success_count INTEGER := 0;
BEGIN
    FOR product_record IN SELECT * FROM jsonb_array_elements(p_products_data)
    LOOP
        BEGIN
            INSERT INTO inventory_products (
                user_id,
                name,
                sku,
                barcode,
                category,
                price,
                cost,
                stock_quantity,
                low_stock_threshold,
                stock_status,
                description,
                status,
                created_at
            ) VALUES (
                p_user_id,
                product_record->>'name',
                product_record->>'sku',
                product_record->>'barcode',
                product_record->>'category',
                COALESCE((product_record->>'price')::DECIMAL, 0),
                COALESCE((product_record->>'cost')::DECIMAL, 0),
                COALESCE((product_record->>'stock_quantity')::INTEGER, 0),
                COALESCE((product_record->>'low_stock_threshold')::INTEGER, 10),
                COALESCE(product_record->>'stock_status', 'in stock'),
                product_record->>'description',
                COALESCE(product_record->>'status', 'active'),
                COALESCE((product_record->>'created_at')::TIMESTAMPTZ, CURRENT_TIMESTAMP)
            );
            
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 'Product ' || COALESCE(product_record->>'name', 'unknown') || ': ' || SQLERRM);
        END;
    END LOOP;

    RETURN QUERY SELECT success_count, error_list;
END;
$$ LANGUAGE plpgsql;

-- 4. Bulk import from CSV format (for large datasets)
CREATE OR REPLACE FUNCTION bulk_import_sales_csv(
    p_user_id UUID,
    p_csv_data TEXT
)
RETURNS TABLE (
    imported_count INTEGER,
    errors TEXT[]
) AS $$
DECLARE
    csv_line TEXT;
    line_parts TEXT[];
    error_list TEXT[] := '{}';
    success_count INTEGER := 0;
BEGIN
    -- Split CSV data into lines
    FOR csv_line IN SELECT unnest(string_to_array(p_csv_data, E'\n'))
    LOOP
        -- Skip empty lines and header
        IF csv_line IS NULL OR csv_line = '' OR csv_line LIKE 'date,%' THEN
            CONTINUE;
        END IF;
        
        BEGIN
            -- Parse CSV line (assuming format: date,invoice_no,source,total_revenue,fees,cash_received)
            line_parts := string_to_array(csv_line, ',');
            
            IF array_length(line_parts, 1) >= 6 THEN
                INSERT INTO cash_receipt_journal (
                    date,
                    invoice_no,
                    source,
                    cr_sales,
                    dr_fees,
                    dr_cash,
                    remarks
                ) VALUES (
                    line_parts[1]::DATE,
                    line_parts[2],
                    line_parts[3],
                    line_parts[4]::DECIMAL,
                    line_parts[5]::DECIMAL,
                    line_parts[6]::DECIMAL,
                    'CSV Import'
                );
                
                success_count := success_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            error_list := array_append(error_list, 'Line: ' || csv_line || ' - ' || SQLERRM);
        END;
    END LOOP;

    RETURN QUERY SELECT success_count, error_list;
END;
$$ LANGUAGE plpgsql;
