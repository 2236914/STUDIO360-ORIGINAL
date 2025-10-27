// ============================================
// HISTORICAL DATA IMPORT API ENDPOINTS
// ============================================

// POST /api/analytics/import/historical-orders
router.post('/import/historical-orders', async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Orders array is required' 
      });
    }

    // Get user ID from auth context (adjust based on your auth system)
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase.rpc('import_historical_orders', {
      p_user_id: userId,
      p_orders_data: JSON.stringify(orders)
    });

    if (error) {
      console.error('Import error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Import failed: ' + error.message 
      });
    }

    const result = data[0];
    return res.json({
      success: true,
      data: {
        imported: result.imported_count,
        errors: result.errors,
        total: orders.length
      }
    });

  } catch (e) {
    console.error('Historical orders import error:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// POST /api/analytics/import/historical-sales
router.post('/import/historical-sales', async (req, res) => {
  try {
    const { sales } = req.body;
    
    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sales array is required' 
      });
    }

    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase.rpc('import_historical_sales', {
      p_user_id: userId,
      p_sales_data: JSON.stringify(sales)
    });

    if (error) {
      console.error('Import error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Import failed: ' + error.message 
      });
    }

    const result = data[0];
    return res.json({
      success: true,
      data: {
        imported: result.imported_count,
        errors: result.errors,
        total: sales.length
      }
    });

  } catch (e) {
    console.error('Historical sales import error:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// POST /api/analytics/import/historical-products
router.post('/import/historical-products', async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Products array is required' 
      });
    }

    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase.rpc('import_historical_products', {
      p_user_id: userId,
      p_products_data: JSON.stringify(products)
    });

    if (error) {
      console.error('Import error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Import failed: ' + error.message 
      });
    }

    const result = data[0];
    return res.json({
      success: true,
      data: {
        imported: result.imported_count,
        errors: result.errors,
        total: products.length
      }
    });

  } catch (e) {
    console.error('Historical products import error:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// POST /api/analytics/import/csv-sales
router.post('/import/csv-sales', async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'CSV data is required' 
      });
    }

    const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
    
    const { data, error } = await supabase.rpc('bulk_import_sales_csv', {
      p_user_id: userId,
      p_csv_data: csvData
    });

    if (error) {
      console.error('CSV import error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'CSV import failed: ' + error.message 
      });
    }

    const result = data[0];
    return res.json({
      success: true,
      data: {
        imported: result.imported_count,
        errors: result.errors
      }
    });

  } catch (e) {
    console.error('CSV sales import error:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// GET /api/analytics/import/template
router.get('/import/template', async (req, res) => {
  try {
    const templates = {
      orders: {
        format: 'JSON',
        example: [
          {
            order_number: 'ORD-001',
            order_date: '2024-01-15',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            customer_phone: '+1234567890',
            status: 'completed',
            subtotal: 100.00,
            total: 100.00,
            items: [
              {
                product_name: 'Product A',
                product_sku: 'SKU-001',
                unit_price: 50.00,
                quantity: 2,
                subtotal: 100.00,
                total: 100.00
              }
            ]
          }
        ]
      },
      sales: {
        format: 'JSON',
        example: [
          {
            date: '2024-01-15',
            invoice_no: 'INV-001',
            source: 'Shopee',
            reference: 'REF-001',
            total_revenue: 100.00,
            fees: 5.00,
            cash_received: 95.00,
            remarks: 'Historical sale'
          }
        ]
      },
      products: {
        format: 'JSON',
        example: [
          {
            name: 'Product A',
            sku: 'SKU-001',
            category: 'Electronics',
            price: 50.00,
            cost: 25.00,
            stock_quantity: 100,
            low_stock_threshold: 10,
            stock_status: 'in stock',
            description: 'Product description'
          }
        ]
      },
      csv: {
        format: 'CSV',
        headers: 'date,invoice_no,source,total_revenue,fees,cash_received',
        example: '2024-01-15,INV-001,Shopee,100.00,5.00,95.00'
      }
    };

    return res.json({
      success: true,
      data: templates
    });

  } catch (e) {
    console.error('Template error:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});
