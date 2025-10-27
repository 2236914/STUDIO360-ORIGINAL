-- ============================================
-- SALES & EXPENSES FORECASTING SQL FUNCTIONS (FIXED)
-- ============================================

-- 1. Get Monthly Sales Data for Forecasting
CREATE OR REPLACE FUNCTION get_monthly_sales_for_forecast(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    month_num INTEGER,
    total_sales DECIMAL,
    sales_by_channel JSONB,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_sales AS (
        SELECT 
            EXTRACT(MONTH FROM crj.date) as month_num,
            SUM(COALESCE(crj.cr_sales, 0)) as total_sales,
            COUNT(*) as transaction_count,
            -- Group by source/channel
            jsonb_object_agg(
                COALESCE(crj.source, 'Unknown'), 
                SUM(COALESCE(crj.cr_sales, 0))
            ) as sales_by_channel
        FROM cash_receipt_journal crj
        WHERE EXTRACT(YEAR FROM crj.date) = p_year
            AND COALESCE(crj.cr_sales, 0) > 0
        GROUP BY EXTRACT(MONTH FROM crj.date)
    )
    SELECT 
        ms.month_num::INTEGER,
        ms.total_sales,
        ms.sales_by_channel,
        ms.transaction_count
    FROM monthly_sales ms
    ORDER BY ms.month_num;
END;
$$ LANGUAGE plpgsql;

-- 2. Get Monthly Expenses Data for Forecasting
CREATE OR REPLACE FUNCTION get_monthly_expenses_for_forecast(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    month_num INTEGER,
    total_expenses DECIMAL,
    expenses_by_category JSONB,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_expenses AS (
        SELECT 
            EXTRACT(MONTH FROM cdb.date) as month_num,
            SUM(
                COALESCE(cdb.dr_materials, 0) +
                COALESCE(cdb.dr_supplies, 0) +
                COALESCE(cdb.dr_rent, 0) +
                COALESCE(cdb.dr_utilities, 0) +
                COALESCE(cdb.dr_advertising, 0) +
                COALESCE(cdb.dr_delivery, 0) +
                COALESCE(cdb.dr_taxes_licenses, 0) +
                COALESCE(cdb.dr_misc, 0)
            ) as total_expenses,
            COUNT(*) as transaction_count,
            -- Group by expense category
            jsonb_build_object(
                'materials', SUM(COALESCE(cdb.dr_materials, 0)),
                'supplies', SUM(COALESCE(cdb.dr_supplies, 0)),
                'rent', SUM(COALESCE(cdb.dr_rent, 0)),
                'utilities', SUM(COALESCE(cdb.dr_utilities, 0)),
                'advertising', SUM(COALESCE(cdb.dr_advertising, 0)),
                'delivery', SUM(COALESCE(cdb.dr_delivery, 0)),
                'taxes_licenses', SUM(COALESCE(cdb.dr_taxes_licenses, 0)),
                'miscellaneous', SUM(COALESCE(cdb.dr_misc, 0))
            ) as expenses_by_category
        FROM cash_disbursement_book cdb
        WHERE EXTRACT(YEAR FROM cdb.date) = p_year
        GROUP BY EXTRACT(MONTH FROM cdb.date)
    )
    SELECT 
        me.month_num::INTEGER,
        me.total_expenses,
        me.expenses_by_category,
        me.transaction_count
    FROM monthly_expenses me
    ORDER BY me.month_num;
END;
$$ LANGUAGE plpgsql;

-- 3. Get Sales Forecast Data (Simplified)
CREATE OR REPLACE FUNCTION get_sales_forecast_data(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    monthly_sales DECIMAL[],
    total_sales DECIMAL,
    avg_monthly_sales DECIMAL,
    growth_rate DECIMAL,
    seasonality TEXT,
    channel_breakdown JSONB
) AS $$
DECLARE
    sales_array DECIMAL[];
    total_amount DECIMAL := 0;
    q1_sales DECIMAL := 0;
    q4_sales DECIMAL := 0;
    growth DECIMAL := 0;
    seasonality_text TEXT := 'Steady Year-Round';
BEGIN
    -- Get monthly sales data
    SELECT ARRAY[
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 1 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 2 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 3 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 4 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 5 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 6 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 7 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 8 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 9 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 10 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 11 THEN crj.cr_sales END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) = 12 THEN crj.cr_sales END), 0)
    ] INTO sales_array
    FROM cash_receipt_journal crj
    WHERE EXTRACT(YEAR FROM crj.date) = p_year;
    
    -- Calculate total sales
    SELECT SUM(crj.cr_sales) INTO total_amount
    FROM cash_receipt_journal crj
    WHERE EXTRACT(YEAR FROM crj.date) = p_year;
    
    -- Calculate Q1 and Q4 sales for growth rate
    SELECT 
        SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) IN (1,2,3) THEN crj.cr_sales END),
        SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) IN (10,11,12) THEN crj.cr_sales END)
    INTO q1_sales, q4_sales
    FROM cash_receipt_journal crj
    WHERE EXTRACT(YEAR FROM crj.date) = p_year;
    
    -- Calculate growth rate
    IF q1_sales > 0 THEN
        growth := ROUND(((q4_sales - q1_sales) * 100.0 / q1_sales), 2);
    END IF;
    
    -- Determine seasonality
    IF q4_sales > (total_amount / 12) * 4 THEN
        seasonality_text := 'High Season: Q4';
    ELSIF SUM(CASE WHEN EXTRACT(MONTH FROM crj.date) IN (6,7,8) THEN crj.cr_sales END) > (total_amount / 12) * 3 THEN
        seasonality_text := 'Peak: Summer';
    END IF;
    
    RETURN QUERY SELECT 
        sales_array,
        COALESCE(total_amount, 0),
        ROUND(COALESCE(total_amount, 0) / 12, 2),
        growth,
        seasonality_text,
        '{}'::JSONB;
END;
$$ LANGUAGE plpgsql;

-- 4. Get Expenses Forecast Data (Simplified)
CREATE OR REPLACE FUNCTION get_expenses_forecast_data(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    monthly_expenses DECIMAL[],
    total_expenses DECIMAL,
    avg_monthly_expenses DECIMAL,
    growth_rate DECIMAL,
    seasonality TEXT,
    category_breakdown JSONB
) AS $$
DECLARE
    expenses_array DECIMAL[];
    total_amount DECIMAL := 0;
    q1_expenses DECIMAL := 0;
    q4_expenses DECIMAL := 0;
    growth DECIMAL := 0;
    seasonality_text TEXT := 'Steady Year-Round';
BEGIN
    -- Get monthly expenses data
    SELECT ARRAY[
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 1 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 2 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 3 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 4 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 5 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 6 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 7 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 8 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 9 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 10 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 11 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0),
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) = 12 THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END), 0)
    ] INTO expenses_array
    FROM cash_disbursement_book cdb
    WHERE EXTRACT(YEAR FROM cdb.date) = p_year;
    
    -- Calculate total expenses
    SELECT SUM(
        cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
        cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc
    ) INTO total_amount
    FROM cash_disbursement_book cdb
    WHERE EXTRACT(YEAR FROM cdb.date) = p_year;
    
    -- Calculate Q1 and Q4 expenses for growth rate
    SELECT 
        SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) IN (1,2,3) THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END),
        SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) IN (10,11,12) THEN 
            cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
            cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END)
    INTO q1_expenses, q4_expenses
    FROM cash_disbursement_book cdb
    WHERE EXTRACT(YEAR FROM cdb.date) = p_year;
    
    -- Calculate growth rate
    IF q1_expenses > 0 THEN
        growth := ROUND(((q4_expenses - q1_expenses) * 100.0 / q1_expenses), 2);
    END IF;
    
    -- Determine seasonality
    IF q4_expenses > (total_amount / 12) * 4 THEN
        seasonality_text := 'High Season: Q4';
    ELSIF SUM(CASE WHEN EXTRACT(MONTH FROM cdb.date) IN (6,7,8) THEN 
        cdb.dr_materials + cdb.dr_supplies + cdb.dr_rent + cdb.dr_utilities + 
        cdb.dr_advertising + cdb.dr_delivery + cdb.dr_taxes_licenses + cdb.dr_misc END) > (total_amount / 12) * 3 THEN
        seasonality_text := 'Peak: Summer';
    END IF;
    
    RETURN QUERY SELECT 
        expenses_array,
        COALESCE(total_amount, 0),
        ROUND(COALESCE(total_amount, 0) / 12, 2),
        growth,
        seasonality_text,
        '{}'::JSONB;
END;
$$ LANGUAGE plpgsql;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crj_date_sales ON public.cash_receipt_journal (date, cr_sales);
CREATE INDEX IF NOT EXISTS idx_cdb_date_expenses ON public.cash_disbursement_book (date);
CREATE INDEX IF NOT EXISTS idx_gj_date_accounts ON public.general_journal (date, account_title_particulars);
