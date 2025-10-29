-- ============================================
-- SALES & EXPENSES FORECASTING SQL FUNCTIONS
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

-- 3. Get Sales Forecast Data (12 months + growth metrics)
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
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT * FROM get_monthly_sales_for_forecast(p_year)
    ),
    sales_array AS (
        SELECT 
            ARRAY[
                COALESCE(SUM(CASE WHEN md.month_num = 1 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 2 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 3 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 4 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 5 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 6 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 7 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 8 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 9 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 10 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 11 THEN md.total_sales END), 0),
                COALESCE(SUM(CASE WHEN md.month_num = 12 THEN md.total_sales END), 0)
            ] as monthly_sales,
            SUM(md.total_sales) as total_sales,
            -- Calculate growth rate (Q4 vs Q1)
            CASE 
                WHEN (SUM(CASE WHEN md.month_num IN (1,2,3) THEN md.total_sales END) > 0)
                THEN ROUND(
                    ((SUM(CASE WHEN md.month_num IN (10,11,12) THEN md.total_sales END) - 
                      SUM(CASE WHEN md.month_num IN (1,2,3) THEN md.total_sales END)) * 100.0 / 
                     SUM(CASE WHEN md.month_num IN (1,2,3) THEN md.total_sales END)), 2
                )
                ELSE 0
            END as growth_rate,
            -- Determine seasonality
            CASE 
                WHEN (SUM(CASE WHEN md.month_num IN (10,11,12) THEN md.total_sales END) > 
                      SUM(md.total_sales) / 12 * 4)
                THEN 'High Season: Q4'
                WHEN (SUM(CASE WHEN md.month_num IN (6,7,8) THEN md.total_sales END) > 
                      SUM(md.total_sales) / 12 * 3)
                THEN 'Peak: Summer'
                ELSE 'Steady Year-Round'
            END as seasonality,
            -- Aggregate channel breakdown
            jsonb_object_agg(
                COALESCE(md.month_num::TEXT, '0'), 
                md.sales_by_channel
            ) as channel_breakdown
        FROM monthly_data md
    )
    SELECT 
        sa.monthly_sales,
        sa.total_sales,
        ROUND(sa.total_sales / 12, 2) as avg_monthly_sales,
        sa.growth_rate,
        sa.seasonality,
        sa.channel_breakdown
    FROM sales_array sa;
END;
$$ LANGUAGE plpgsql;

-- 4. Get Expenses Forecast Data (12 months + growth metrics)
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
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT * FROM get_monthly_expenses_for_forecast(p_year)
    ),
    expenses_array AS (
        SELECT 
            ARRAY[
                COALESCE(SUM(CASE WHEN month_num = 1 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 2 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 3 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 4 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 5 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 6 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 7 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 8 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 9 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 10 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 11 THEN total_expenses END), 0),
                COALESCE(SUM(CASE WHEN month_num = 12 THEN total_expenses END), 0)
            ] as monthly_expenses,
            SUM(total_expenses) as total_expenses,
            -- Calculate growth rate (Q4 vs Q1)
            CASE 
                WHEN (SUM(CASE WHEN month_num IN (1,2,3) THEN total_expenses END) > 0)
                THEN ROUND(
                    ((SUM(CASE WHEN month_num IN (10,11,12) THEN total_expenses END) - 
                      SUM(CASE WHEN month_num IN (1,2,3) THEN total_expenses END)) * 100.0 / 
                     SUM(CASE WHEN month_num IN (1,2,3) THEN total_expenses END)), 2
                )
                ELSE 0
            END as growth_rate,
            -- Determine seasonality
            CASE 
                WHEN (SUM(CASE WHEN month_num IN (10,11,12) THEN total_expenses END) > 
                      SUM(total_expenses) / 12 * 4)
                THEN 'High Season: Q4'
                WHEN (SUM(CASE WHEN month_num IN (6,7,8) THEN total_expenses END) > 
                      SUM(total_expenses) / 12 * 3)
                THEN 'Peak: Summer'
                ELSE 'Steady Year-Round'
            END as seasonality,
            -- Aggregate category breakdown
            jsonb_object_agg(
                COALESCE(month_num::TEXT, '0'), 
                expenses_by_category
            ) as category_breakdown
        FROM monthly_data
    )
    SELECT 
        ea.monthly_expenses,
        ea.total_expenses,
        ROUND(ea.total_expenses / 12, 2) as avg_monthly_expenses,
        ea.growth_rate,
        ea.seasonality,
        ea.category_breakdown
    FROM expenses_array ea;
END;
$$ LANGUAGE plpgsql;

-- 5. Get Combined Financial Forecast Data
CREATE OR REPLACE FUNCTION get_financial_forecast_data(
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
)
RETURNS TABLE (
    sales_data JSONB,
    expenses_data JSONB,
    profit_margin DECIMAL,
    net_profit DECIMAL,
    forecast_summary JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH sales AS (
        SELECT * FROM get_sales_forecast_data(p_year)
    ),
    expenses AS (
        SELECT * FROM get_expenses_forecast_data(p_year)
    )
    SELECT 
        jsonb_build_object(
            'monthly_sales', s.monthly_sales,
            'total_sales', s.total_sales,
            'avg_monthly_sales', s.avg_monthly_sales,
            'growth_rate', s.growth_rate,
            'seasonality', s.seasonality,
            'channel_breakdown', s.channel_breakdown
        ) as sales_data,
        jsonb_build_object(
            'monthly_expenses', e.monthly_expenses,
            'total_expenses', e.total_expenses,
            'avg_monthly_expenses', e.avg_monthly_expenses,
            'growth_rate', e.growth_rate,
            'seasonality', e.seasonality,
            'category_breakdown', e.category_breakdown
        ) as expenses_data,
        CASE 
            WHEN s.total_sales > 0 
            THEN ROUND(((s.total_sales - e.total_expenses) / s.total_sales) * 100, 2)
            ELSE 0
        END as profit_margin,
        (s.total_sales - e.total_expenses) as net_profit,
        jsonb_build_object(
            'year', p_year,
            'total_revenue', s.total_sales,
            'total_costs', e.total_expenses,
            'net_profit', (s.total_sales - e.total_expenses),
            'profit_margin_percent', CASE 
                WHEN s.total_sales > 0 
                THEN ROUND(((s.total_sales - e.total_expenses) / s.total_sales) * 100, 2)
                ELSE 0
            END,
            'sales_growth_rate', s.growth_rate,
            'expense_growth_rate', e.growth_rate
        ) as forecast_summary
    FROM sales s, expenses e;
END;
$$ LANGUAGE plpgsql;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crj_date_sales ON public.cash_receipt_journal (date, cr_sales);
CREATE INDEX IF NOT EXISTS idx_cdb_date_expenses ON public.cash_disbursement_book (date);
CREATE INDEX IF NOT EXISTS idx_gj_date_accounts ON public.general_journal (date, account_title_particulars);

-- 7. Grant permissions (adjust as needed for your setup)
-- GRANT EXECUTE ON FUNCTION get_monthly_sales_for_forecast TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_monthly_expenses_for_forecast TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_sales_forecast_data TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_expenses_forecast_data TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_financial_forecast_data TO your_app_user;
