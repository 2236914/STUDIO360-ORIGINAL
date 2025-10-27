-- ============================================
-- FINANCIAL FORECASTING SETUP SCRIPT
-- ============================================

-- Run this script to set up financial forecasting SQL functions
-- Make sure you're connected to your Supabase database

-- 1. First, run the migration file
-- \i database/migrations/2025-01-22_financial_forecasting.sql

-- 2. Test the functions with sample data
-- Replace 2025 with your desired year

-- Test monthly sales function
SELECT * FROM get_monthly_sales_for_forecast(2025);

-- Test monthly expenses function  
SELECT * FROM get_monthly_expenses_for_forecast(2025);

-- Test sales forecast function
SELECT * FROM get_sales_forecast_data(2025);

-- Test expenses forecast function
SELECT * FROM get_expenses_forecast_data(2025);

-- Test combined financial forecast function
SELECT * FROM get_financial_forecast_data(2025);

-- 3. Sample data insertion (optional - for testing)
-- Insert some sample sales data to test the functions

-- Sample sales data
INSERT INTO cash_receipt_journal (
    date, invoice_no, source, reference, cr_sales, remarks
) VALUES 
    ('2025-01-15', 'INV-001', '360', 'REF-001', 5000.00, 'Sample sale'),
    ('2025-01-20', 'INV-002', 'Shopee', 'REF-002', 3000.00, 'Sample sale'),
    ('2025-02-10', 'INV-003', 'TikTok', 'REF-003', 4000.00, 'Sample sale'),
    ('2025-02-15', 'INV-004', '360', 'REF-004', 6000.00, 'Sample sale'),
    ('2025-03-05', 'INV-005', 'Shopee', 'REF-005', 3500.00, 'Sample sale')
ON CONFLICT DO NOTHING;

-- Sample expense data
INSERT INTO cash_disbursement_book (
    date, payee_particulars, reference, dr_rent, dr_utilities, dr_advertising, remarks
) VALUES 
    ('2025-01-01', 'Landlord', 'RENT-001', 2000.00, 0, 0, 'Monthly rent'),
    ('2025-01-05', 'Electric Company', 'UTIL-001', 0, 500.00, 0, 'Electric bill'),
    ('2025-01-10', 'Facebook Ads', 'AD-001', 0, 0, 1000.00, 'Marketing campaign'),
    ('2025-02-01', 'Landlord', 'RENT-002', 2000.00, 0, 0, 'Monthly rent'),
    ('2025-02-05', 'Electric Company', 'UTIL-002', 0, 600.00, 0, 'Electric bill')
ON CONFLICT DO NOTHING;

-- 4. Verify the setup
SELECT 
    'Sales Forecast Function' as function_name,
    COUNT(*) as result_count
FROM get_sales_forecast_data(2025)

UNION ALL

SELECT 
    'Expenses Forecast Function' as function_name,
    COUNT(*) as result_count
FROM get_expenses_forecast_data(2025)

UNION ALL

SELECT 
    'Financial Forecast Function' as function_name,
    COUNT(*) as result_count
FROM get_financial_forecast_data(2025);

-- 5. Performance check
EXPLAIN ANALYZE SELECT * FROM get_financial_forecast_data(2025);

-- 6. Sample query to get forecast data for API
SELECT 
    jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'year', 2025,
            'sales', sales_data,
            'expenses', expenses_data,
            'profit_margin', profit_margin,
            'net_profit', net_profit,
            'summary', forecast_summary
        )
    ) as api_response
FROM get_financial_forecast_data(2025);
