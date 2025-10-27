const express = require('express');
const router = express.Router();
const vouchersService = require('../../services/vouchersService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

// ============================================
// VOUCHER ROUTES
// ============================================

/**
 * @route GET /api/vouchers
 * @desc Get all vouchers with optional filters
 * @access Private
 */
router.get('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    console.log('🔵 GET /api/vouchers - userId:', userId);
    console.log('User object:', req.user);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const filters = {
      status: req.query.status ? req.query.status.split(',') : [],
      type: req.query.type ? req.query.type.split(',') : [],
      search: req.query.search,
    };

    console.log('Fetching vouchers with filters:', filters);

    const vouchers = await vouchersService.getVouchers(userId, filters);
    
    console.log('✅ Returning vouchers to frontend:', vouchers.length);
    
    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/vouchers/stats
 * @desc Get voucher statistics
 * @access Private
 */
router.get('/stats', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const stats = await vouchersService.getVoucherStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching voucher stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/vouchers/:id
 * @desc Get voucher by ID
 * @access Private
 */
router.get('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const voucher = await vouchersService.getVoucherById(id, userId);
    
    if (!voucher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Voucher not found' 
      });
    }
    
    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/vouchers/code/:code
 * @desc Get voucher by code
 * @access Private
 */
router.get('/code/:code', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { code } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const voucher = await vouchersService.getVoucherByCode(code, userId);
    
    if (!voucher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Voucher not found' 
      });
    }
    
    res.json({
      success: true,
      data: voucher
    });
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/vouchers
 * @desc Create a new voucher
 * @access Private
 */
router.post('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    console.log('POST /api/vouchers - userId:', userId);
    console.log('User object:', req.user);
    console.log('Request body:', req.body);
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const voucherData = req.body;
    
    if (!voucherData.name || !voucherData.code || !voucherData.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, code, and type are required' 
      });
    }

    const newVoucher = await vouchersService.createVoucher(userId, voucherData);
    
    if (newVoucher.error) {
      console.error('Voucher creation error:', newVoucher.error);
      return res.status(400).json({ 
        success: false, 
        message: newVoucher.error 
      });
    }
    
    console.log('Voucher created successfully:', newVoucher.id);
    
    res.status(201).json({
      success: true,
      data: newVoucher,
      message: 'Voucher created successfully'
    });
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/vouchers/:id
 * @desc Update voucher
 * @access Private
 */
router.put('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updateData = req.body;
    const updatedVoucher = await vouchersService.updateVoucher(id, userId, updateData);
    
    if (updatedVoucher.error) {
      return res.status(400).json({ 
        success: false, 
        message: updatedVoucher.error 
      });
    }
    
    res.json({
      success: true,
      data: updatedVoucher,
      message: 'Voucher updated successfully'
    });
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/vouchers/:id/toggle
 * @desc Toggle voucher active status
 * @access Private
 */
router.put('/:id/toggle', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedVoucher = await vouchersService.toggleVoucherStatus(id, userId);
    
    if (!updatedVoucher) {
      return res.status(404).json({ 
        success: false, 
        message: 'Voucher not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedVoucher,
      message: 'Voucher status updated successfully'
    });
  } catch (error) {
    console.error('Error toggling voucher status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/vouchers/:id
 * @desc Delete voucher
 * @access Private
 */
router.delete('/:id', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const success = await vouchersService.deleteVoucher(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Voucher not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/vouchers
 * @desc Delete multiple vouchers
 * @access Private
 */
router.delete('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Voucher IDs array is required' 
      });
    }

    const success = await vouchersService.deleteVouchers(ids, userId);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete vouchers' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} voucher(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting vouchers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// VOUCHER VALIDATION & USAGE ROUTES
// ============================================

/**
 * @route POST /api/vouchers/validate
 * @desc Validate voucher code
 * @access Private
 */
router.post('/validate', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const { code, customer_id, cart_total } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Voucher code is required' 
      });
    }

    const validation = await vouchersService.validateVoucher(
      userId, 
      code, 
      customer_id, 
      cart_total || 0
    );
    
    res.json({
      success: validation.is_valid,
      data: validation
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/vouchers/:id/apply
 * @desc Apply voucher (record usage)
 * @access Private
 */
router.post('/:id/apply', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const usageData = req.body;
    const usage = await vouchersService.applyVoucher(userId, id, usageData);
    
    if (!usage) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to apply voucher' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: usage,
      message: 'Voucher applied successfully'
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/vouchers/:id/usage
 * @desc Get voucher usage history
 * @access Private
 */
router.get('/:id/usage', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const usage = await vouchersService.getVoucherUsage(id, userId);
    
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error fetching voucher usage:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

