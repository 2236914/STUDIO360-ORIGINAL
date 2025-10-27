// ============================================
// SHOPEE DATA IMPORT API ENDPOINT
// ============================================

const express = require('express');
const router = express.Router();
const { supabase } = require('../../services/supabaseClient');

// POST /api/analytics/import/shopee-data
router.post('/import/shopee-data', async (req, res) => {
  try {
    const { user_id, shopee_data } = req.body;
    
    if (!user_id || !shopee_data) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id and shopee_data are required' 
      });
    }

    // Import data using Supabase function
    const { data, error } = await supabase.rpc('import_shopee_analytics_data', {
      p_user_id: user_id,
      p_shopee_data: shopee_data
    });

    if (error) {
      console.error('Error importing Shopee data:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to import Shopee data',
        error: error.message 
      });
    }

    return res.json({
      success: true,
      message: 'Shopee data imported successfully',
      data: data[0] // Returns imported_products, total_sales, total_units
    });

  } catch (e) {
    console.error('Error in shopee import endpoint:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// POST /api/analytics/import/sku-mapping
router.post('/import/sku-mapping', async (req, res) => {
  try {
    const { user_id, mappings } = req.body;
    
    if (!user_id || !mappings) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id and mappings are required' 
      });
    }

    // Insert SKU mappings
    const { data, error } = await supabase
      .from('sku_mappings')
      .insert(mappings.map(mapping => ({
        user_id,
        platform: mapping.platform,
        platform_sku: mapping.platform_sku,
        internal_sku: mapping.internal_sku,
        product_name: mapping.product_name
      })));

    if (error) {
      console.error('Error creating SKU mappings:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create SKU mappings',
        error: error.message 
      });
    }

    return res.json({
      success: true,
      message: 'SKU mappings created successfully',
      data: { imported_mappings: mappings.length }
    });

  } catch (e) {
    console.error('Error in SKU mapping endpoint:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

// GET /api/analytics/unified-forecast
router.get('/unified-forecast', async (req, res) => {
  try {
    const { user_id, year = new Date().getFullYear() } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id is required' 
      });
    }

    // Get unified forecast data
    const { data, error } = await supabase.rpc('get_unified_product_forecast', {
      p_user_id: user_id,
      p_year: parseInt(year)
    });

    if (error) {
      console.error('Error getting unified forecast:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to get unified forecast',
        error: error.message 
      });
    }

    return res.json({
      success: true,
      data: {
        year: parseInt(year),
        products: data,
        summary: {
          totalProducts: data.length,
          totalSales: data.reduce((sum, p) => sum + parseFloat(p.total_sales), 0),
          avgGrowthRate: data.length > 0 ? 
            data.reduce((sum, p) => sum + parseFloat(p.growth_rate), 0) / data.length : 0
        }
      }
    });

  } catch (e) {
    console.error('Error in unified forecast endpoint:', e);
    return res.status(500).json({ 
      success: false, 
      message: e.message 
    });
  }
});

module.exports = router;
