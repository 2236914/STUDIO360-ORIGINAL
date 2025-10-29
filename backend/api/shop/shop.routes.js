const express = require('express');
const router = express.Router();
const shopService = require('../../services/shopService');
const { authenticateTokenHybrid, requireRole } = require('../../middleware/auth');

// Require authenticated seller or admin for all shop routes
router.use(authenticateTokenHybrid, requireRole(['seller', 'admin_it']));

/**
 * @route GET /api/shop/complete
 * @desc Get complete shop data (shop info, shipping settings, couriers with rates)
 * @access Private (seller/admin_it)
 */
router.get('/complete', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    console.log('Shop complete request - User ID:', userId);
    console.log('Shop complete request - User object:', req.user);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shopData = await shopService.getCompleteShopData(userId);
    console.log('Shop data retrieved:', shopData);
    
    res.json({
      success: true,
      data: shopData
    });
  } catch (error) {
    console.error('Error fetching complete shop data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/shop/info
 * @desc Get shop information
 * @access Private (seller/admin_it)
 */
router.get('/info', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shopInfo = await shopService.getShopInfo(userId);
    
    res.json({
      success: true,
      data: shopInfo
    });
  } catch (error) {
    console.error('Error fetching shop info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/shop/info
 * @desc Update shop information
 * @access Private (seller/admin_it)
 */
router.put('/info', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const {
      shop_name,
      email,
      phone_number,
      shop_category,
      profile_photo_url,
      street_address,
      barangay,
      city,
      province,
      zip_code
    } = req.body;

    const shopData = {
      shop_name,
      email,
      phone_number,
      shop_category,
      profile_photo_url,
      street_address,
      barangay,
      city,
      province,
      zip_code
    };

    // Remove undefined values
    Object.keys(shopData).forEach(key => {
      if (shopData[key] === undefined) {
        delete shopData[key];
      }
    });

    const updatedShopInfo = await shopService.upsertShopInfo(userId, shopData);
    
    if (!updatedShopInfo) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update shop information' 
      });
    }
    
    res.json({
      success: true,
      data: updatedShopInfo,
      message: 'Shop information updated successfully'
    });
  } catch (error) {
    console.error('Error updating shop info:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/shop/shipping
 * @desc Get shipping settings
 * @access Private (seller/admin_it)
 */
router.get('/shipping', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const shippingSettings = await shopService.getShippingSettings(userId);
    
    res.json({
      success: true,
      data: shippingSettings
    });
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/shop/shipping
 * @desc Update shipping settings
 * @access Private (seller/admin_it)
 */
router.put('/shipping', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { enable_free_shipping, minimum_order_amount } = req.body;

    const settingsData = {
      enable_free_shipping,
      minimum_order_amount
    };

    // Remove undefined values
    Object.keys(settingsData).forEach(key => {
      if (settingsData[key] === undefined) {
        delete settingsData[key];
      }
    });

    const updatedSettings = await shopService.upsertShippingSettings(userId, settingsData);
    
    if (!updatedSettings) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update shipping settings' 
      });
    }
    
    res.json({
      success: true,
      data: updatedSettings,
      message: 'Shipping settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating shipping settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/shop/couriers
 * @desc Get all couriers
 * @access Private (seller/admin_it)
 */
router.get('/couriers', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const couriers = await shopService.getCouriers(userId);
    
    res.json({
      success: true,
      data: couriers
    });
  } catch (error) {
    console.error('Error fetching couriers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/shop/couriers
 * @desc Create a new courier
 * @access Private (seller/admin_it)
 */
router.post('/couriers', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { name, is_active = true } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Courier name is required' 
      });
    }

    const courierData = { name, is_active };
    const newCourier = await shopService.createCourier(userId, courierData);
    
    if (!newCourier) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create courier' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newCourier,
      message: 'Courier created successfully'
    });
  } catch (error) {
    console.error('Error creating courier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/shop/couriers/:id
 * @desc Update courier
 * @access Private (seller/admin_it)
 */
router.put('/couriers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (is_active !== undefined) updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required for update' 
      });
    }

    const updatedCourier = await shopService.updateCourier(id, updateData);
    
    if (!updatedCourier) {
      return res.status(404).json({ 
        success: false, 
        message: 'Courier not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedCourier,
      message: 'Courier updated successfully'
    });
  } catch (error) {
    console.error('Error updating courier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/shop/couriers/:id
 * @desc Delete courier
 * @access Private (seller/admin_it)
 */
router.delete('/couriers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const success = await shopService.deleteCourier(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Courier not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Courier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting courier:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/shop/couriers/:id/rates
 * @desc Get regional shipping rates for a courier
 * @access Private (seller/admin_it)
 */
router.get('/couriers/:id/rates', async (req, res) => {
  try {
    const { id } = req.params;

    const rates = await shopService.getRegionalRates(id);
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error fetching regional rates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/shop/couriers/:id/rates
 * @desc Update regional shipping rates for a courier
 * @access Private (seller/admin_it)
 */
router.put('/couriers/:id/rates', async (req, res) => {
  try {
    const { id: courierId } = req.params;
    const { rates } = req.body;

    if (!Array.isArray(rates)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rates must be an array' 
      });
    }

    const updatedRates = [];
    
    for (const rate of rates) {
      const { region_name, region_description, price, is_active } = rate;
      
      if (!region_name || price === undefined) {
        continue; // Skip invalid rates
      }

      const rateData = {
        region_name,
        region_description,
        price: parseFloat(price),
        is_active: Boolean(is_active)
      };

      const updatedRate = await shopService.upsertRegionalRate(courierId, rateData);
      if (updatedRate) {
        updatedRates.push(updatedRate);
      }
    }
    
    res.json({
      success: true,
      data: updatedRates,
      message: 'Regional rates updated successfully'
    });
  } catch (error) {
    console.error('Error updating regional rates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/shop/stats
 * @desc Get shop statistics
 * @access Private (seller/admin_it)
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const [activeRegionsCount, couriers] = await Promise.all([
      shopService.getActiveRegionsCount(userId),
      shopService.getCouriers(userId)
    ]);

    const activeCouriersCount = couriers.filter(c => c.is_active).length;
    
    res.json({
      success: true,
      data: {
        activeRegionsCount,
        activeCouriersCount,
        totalCouriersCount: couriers.length
      }
    });
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
