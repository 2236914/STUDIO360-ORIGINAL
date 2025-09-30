/**
 * Voucher Routes
 * Handles voucher management endpoints for sellers and buyers
 */

const express = require('express');
const router = express.Router();

// In-memory storage for vouchers (replace with DB later)
const vouchers = [];

// Voucher types
const VOUCHER_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  FREE_SHIPPING: 'free_shipping',
  BUY_X_GET_Y: 'buy_x_get_y',
};

// Voucher status
const VOUCHER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  USED: 'used',
};

// Helper functions
function ok(res, payload) {
  return res.json({ success: true, ...payload });
}

function bad(res, message, status = 400) {
  return res.status(status).json({ success: false, message });
}

function generateVoucherCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function validateVoucherData(voucherData) {
  const { name, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, applicableTo } = voucherData;
  
  if (!name || !type || !value) {
    return 'Name, type, and value are required';
  }
  
  if (!Object.values(VOUCHER_TYPES).includes(type)) {
    return 'Invalid voucher type';
  }
  
  if (typeof value !== 'number' || value <= 0) {
    return 'Value must be a positive number';
  }
  
  if (type === VOUCHER_TYPES.PERCENTAGE && value > 100) {
    return 'Percentage discount cannot exceed 100%';
  }
  
  if (minOrderAmount && (typeof minOrderAmount !== 'number' || minOrderAmount < 0)) {
    return 'Minimum order amount must be a non-negative number';
  }
  
  if (maxDiscount && (typeof maxDiscount !== 'number' || maxDiscount < 0)) {
    return 'Maximum discount must be a non-negative number';
  }
  
  if (usageLimit && (typeof usageLimit !== 'number' || usageLimit < 1)) {
    return 'Usage limit must be a positive number';
  }
  
  if (validFrom && validUntil && new Date(validFrom) >= new Date(validUntil)) {
    return 'Valid until date must be after valid from date';
  }
  
  return null;
}

/**
 * @route   GET /api/vouchers
 * @desc    Get all vouchers with filtering and pagination
 * @access  Private
 */
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const status = req.query.status;
    const type = req.query.type;
    const search = req.query.search;
    
    let filteredVouchers = [...vouchers];
    
    // Filter by status
    if (status && Object.values(VOUCHER_STATUS).includes(status)) {
      filteredVouchers = filteredVouchers.filter(v => v.status === status);
    }
    
    // Filter by type
    if (type && Object.values(VOUCHER_TYPES).includes(type)) {
      filteredVouchers = filteredVouchers.filter(v => v.type === type);
    }
    
    // Search by name or code
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVouchers = filteredVouchers.filter(v => 
        v.name.toLowerCase().includes(searchLower) || 
        v.code.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by created date (newest first)
    filteredVouchers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVouchers = filteredVouchers.slice(startIndex, endIndex);
    
    return ok(res, {
      message: 'Vouchers retrieved successfully',
      data: {
        vouchers: paginatedVouchers,
        pagination: {
          page,
          limit,
          total: filteredVouchers.length,
          totalPages: Math.ceil(filteredVouchers.length / limit),
        }
      }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   GET /api/vouchers/:id
 * @desc    Get voucher by ID
 * @access  Private
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const voucher = vouchers.find(v => v.id === parseInt(id));
    
    if (!voucher) {
      return bad(res, 'Voucher not found', 404);
    }
    
    return ok(res, {
      message: 'Voucher retrieved successfully',
      data: { voucher }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   POST /api/vouchers
 * @desc    Create a new voucher
 * @access  Private
 */
router.post('/', (req, res) => {
  try {
    const voucherData = req.body;
    
    // Validate voucher data
    const validationError = validateVoucherData(voucherData);
    if (validationError) {
      return bad(res, validationError);
    }
    
    // Generate unique voucher code
    let code;
    let attempts = 0;
    do {
      code = generateVoucherCode();
      attempts++;
    } while (vouchers.find(v => v.code === code) && attempts < 10);
    
    if (attempts >= 10) {
      return bad(res, 'Failed to generate unique voucher code', 500);
    }
    
    // Create voucher
    const voucher = {
      id: vouchers.length + 1,
      code,
      name: voucherData.name,
      description: voucherData.description || '',
      type: voucherData.type,
      value: voucherData.value,
      minOrderAmount: voucherData.minOrderAmount || 0,
      maxDiscount: voucherData.maxDiscount || null,
      usageLimit: voucherData.usageLimit || null,
      usedCount: 0,
      validFrom: voucherData.validFrom || new Date().toISOString(),
      validUntil: voucherData.validUntil || null,
      applicableTo: voucherData.applicableTo || 'all', // 'all', 'products', 'categories'
      applicableIds: voucherData.applicableIds || [],
      status: VOUCHER_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: voucherData.createdBy || 'system', // In real app, get from auth
    };
    
    vouchers.push(voucher);
    
    return ok(res, {
      message: 'Voucher created successfully',
      data: { voucher }
    }, 201);
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   PUT /api/vouchers/:id
 * @desc    Update a voucher
 * @access  Private
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const voucherData = req.body;
    
    const voucherIndex = vouchers.findIndex(v => v.id === parseInt(id));
    if (voucherIndex === -1) {
      return bad(res, 'Voucher not found', 404);
    }
    
    // Validate voucher data
    const validationError = validateVoucherData(voucherData);
    if (validationError) {
      return bad(res, validationError);
    }
    
    // Update voucher
    const updatedVoucher = {
      ...vouchers[voucherIndex],
      name: voucherData.name,
      description: voucherData.description || vouchers[voucherIndex].description,
      type: voucherData.type,
      value: voucherData.value,
      minOrderAmount: voucherData.minOrderAmount || 0,
      maxDiscount: voucherData.maxDiscount || null,
      usageLimit: voucherData.usageLimit || null,
      validFrom: voucherData.validFrom || vouchers[voucherIndex].validFrom,
      validUntil: voucherData.validUntil || null,
      applicableTo: voucherData.applicableTo || 'all',
      applicableIds: voucherData.applicableIds || [],
      status: voucherData.status || vouchers[voucherIndex].status,
      updatedAt: new Date().toISOString(),
    };
    
    vouchers[voucherIndex] = updatedVoucher;
    
    return ok(res, {
      message: 'Voucher updated successfully',
      data: { voucher: updatedVoucher }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   DELETE /api/vouchers/:id
 * @desc    Delete a voucher
 * @access  Private
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const voucherIndex = vouchers.findIndex(v => v.id === parseInt(id));
    
    if (voucherIndex === -1) {
      return bad(res, 'Voucher not found', 404);
    }
    
    vouchers.splice(voucherIndex, 1);
    
    return ok(res, {
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   POST /api/vouchers/:id/toggle-status
 * @desc    Toggle voucher status (active/inactive)
 * @access  Private
 */
router.post('/:id/toggle-status', (req, res) => {
  try {
    const { id } = req.params;
    const voucherIndex = vouchers.findIndex(v => v.id === parseInt(id));
    
    if (voucherIndex === -1) {
      return bad(res, 'Voucher not found', 404);
    }
    
    const voucher = vouchers[voucherIndex];
    const newStatus = voucher.status === VOUCHER_STATUS.ACTIVE 
      ? VOUCHER_STATUS.INACTIVE 
      : VOUCHER_STATUS.ACTIVE;
    
    voucher.status = newStatus;
    voucher.updatedAt = new Date().toISOString();
    
    return ok(res, {
      message: `Voucher ${newStatus === VOUCHER_STATUS.ACTIVE ? 'activated' : 'deactivated'} successfully`,
      data: { voucher }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   POST /api/vouchers/validate
 * @desc    Validate voucher code for buyer
 * @access  Private
 */
router.post('/validate', (req, res) => {
  try {
    const { code, orderAmount, items } = req.body;
    
    if (!code) {
      return bad(res, 'Voucher code is required');
    }
    
    const voucher = vouchers.find(v => v.code === code.toUpperCase());
    
    if (!voucher) {
      return bad(res, 'Invalid voucher code');
    }
    
    // Check if voucher is active
    if (voucher.status !== VOUCHER_STATUS.ACTIVE) {
      return bad(res, 'Voucher is not active');
    }
    
    // Check if voucher has expired
    const now = new Date();
    if (voucher.validUntil && new Date(voucher.validUntil) < now) {
      return bad(res, 'Voucher has expired');
    }
    
    // Check if voucher is still valid from
    if (new Date(voucher.validFrom) > now) {
      return bad(res, 'Voucher is not yet valid');
    }
    
    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return bad(res, 'Voucher usage limit exceeded');
    }
    
    // Check minimum order amount
    if (voucher.minOrderAmount && orderAmount < voucher.minOrderAmount) {
      return bad(res, `Minimum order amount of ${voucher.minOrderAmount} required`);
    }
    
    // Calculate discount
    let discount = 0;
    if (voucher.type === VOUCHER_TYPES.PERCENTAGE) {
      discount = (orderAmount * voucher.value) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else if (voucher.type === VOUCHER_TYPES.FIXED_AMOUNT) {
      discount = Math.min(voucher.value, orderAmount);
    } else if (voucher.type === VOUCHER_TYPES.FREE_SHIPPING) {
      discount = 0; // Free shipping handled separately
    }
    
    return ok(res, {
      message: 'Voucher is valid',
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          type: voucher.type,
          discount,
          isFreeShipping: voucher.type === VOUCHER_TYPES.FREE_SHIPPING
        }
      }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   POST /api/vouchers/:id/apply
 * @desc    Apply voucher to order (increment usage count)
 * @access  Private
 */
router.post('/:id/apply', (req, res) => {
  try {
    const { id } = req.params;
    const voucherIndex = vouchers.findIndex(v => v.id === parseInt(id));
    
    if (voucherIndex === -1) {
      return bad(res, 'Voucher not found', 404);
    }
    
    const voucher = vouchers[voucherIndex];
    voucher.usedCount += 1;
    voucher.updatedAt = new Date().toISOString();
    
    // Check if usage limit reached
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      voucher.status = VOUCHER_STATUS.USED;
    }
    
    return ok(res, {
      message: 'Voucher applied successfully',
      data: { voucher }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

/**
 * @route   GET /api/vouchers/stats/summary
 * @desc    Get voucher statistics summary
 * @access  Private
 */
router.get('/stats/summary', (req, res) => {
  try {
    const totalVouchers = vouchers.length;
    const activeVouchers = vouchers.filter(v => v.status === VOUCHER_STATUS.ACTIVE).length;
    const usedVouchers = vouchers.filter(v => v.status === VOUCHER_STATUS.USED).length;
    const expiredVouchers = vouchers.filter(v => v.status === VOUCHER_STATUS.EXPIRED).length;
    
    const totalUsage = vouchers.reduce((sum, v) => sum + v.usedCount, 0);
    
    const typeStats = Object.values(VOUCHER_TYPES).map(type => ({
      type,
      count: vouchers.filter(v => v.type === type).length
    }));
    
    return ok(res, {
      message: 'Voucher statistics retrieved successfully',
      data: {
        summary: {
          totalVouchers,
          activeVouchers,
          usedVouchers,
          expiredVouchers,
          totalUsage
        },
        typeStats
      }
    });
  } catch (error) {
    return bad(res, error.message, 500);
  }
});

module.exports = router;
