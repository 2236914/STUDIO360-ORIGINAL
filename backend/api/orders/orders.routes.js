const express = require('express');
const router = express.Router();
const ordersService = require('../../services/ordersService');
const { authenticateTokenHybrid } = require('../../middleware/auth');
const { supabase } = require('../../services/supabaseClient');

/**
 * Helper function to get store owner user_id from shop name
 */
async function getUserIdByShopName(shopName) {
  try {
    if (!shopName || typeof shopName !== 'string') {
      console.error(`[Orders] Invalid shopName: ${shopName}`);
      return null;
    }

    // Normalize shop name: lowercase and remove spaces for comparison
    const normalizedShopName = shopName.toLowerCase().replace(/\s+/g, '');
    
    console.log(`[Orders] Looking up shop: "${shopName}" (normalized: "${normalizedShopName}")`);

    // Try exact match first
    let { data, error } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .eq('shop_name', shopName)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) {
      // Try case-insensitive match
      const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
        .from('shop_info')
        .select('user_id, shop_name')
        .ilike('shop_name', shopName)
        .is('deleted_at', null)
        .maybeSingle();

      if (!caseInsensitiveError && caseInsensitiveData) {
        console.log(`[Orders] Found shop via case-insensitive match: "${caseInsensitiveData.shop_name}"`);
        return caseInsensitiveData.user_id;
      }

      // Try normalized match (remove spaces and case differences)
      // Fetch all shops and match manually
      const { data: allShops, error: allShopsError } = await supabase
        .from('shop_info')
        .select('user_id, shop_name')
        .is('deleted_at', null);

      if (!allShopsError && allShops) {
        for (const shop of allShops) {
          const normalizedDbShopName = shop.shop_name.toLowerCase().replace(/\s+/g, '');
          if (normalizedDbShopName === normalizedShopName) {
            console.log(`[Orders] Found shop via normalized match: "${shop.shop_name}"`);
            return shop.user_id;
          }
        }
      }

      // Log all available shops for debugging
      console.error(`[Orders] Shop not found: "${shopName}"`);
      if (!allShopsError && allShops && allShops.length > 0) {
        console.error(`[Orders] Available shops: ${allShops.map(s => `"${s.shop_name}"`).join(', ')}`);
      }
      
      return null;
    }
    
    console.log(`[Orders] Found shop via exact match: "${data.shop_name}"`);
    return data.user_id;
  } catch (e) {
    console.error(`[Orders] Error looking up shop "${shopName}":`, e);
    return null;
  }
}

// ============================================
// ORDER ROUTES
// ============================================

/**
 * @route GET /api/orders
 * @desc Get all orders with optional filters
 * @access Private
 */
router.get('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const filters = {
      status: req.query.status ? req.query.status.split(',') : [],
      payment_status: req.query.payment_status,
      search: req.query.search,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };

    const orders = await ordersService.getOrders(userId, filters);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/orders/stats
 * @desc Get order statistics
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

    const stats = await ordersService.getOrderStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/orders/:id
 * @desc Get order by ID
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

    const order = await ordersService.getOrderById(id, userId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/orders/number/:orderNumber
 * @desc Get order by order number
 * @access Private
 */
router.get('/number/:orderNumber', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderNumber } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const order = await ordersService.getOrderByNumber(orderNumber, userId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/orders/public
 * @desc Create a new order (public endpoint for COD and guest checkout)
 * @access Public
 */
// Get the default kitschstudio user_id (cached)
let cachedKitschstudioUserId = null;

async function getKitschstudioUserId() {
  if (cachedKitschstudioUserId) {
    return cachedKitschstudioUserId;
  }

  try {
    // Try exact match first (shop name is "kitschstudio" in database)
    const { data: exactMatch, error: exactError } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .eq('shop_name', 'kitschstudio')
      .is('deleted_at', null)
      .maybeSingle();

    if (!exactError && exactMatch) {
      cachedKitschstudioUserId = exactMatch.user_id;
      console.log(`[Orders] ✓ Found kitschstudio shop via exact match: "${exactMatch.shop_name}" (userId: ${exactMatch.user_id})`);
      return exactMatch.user_id;
    }

    // Fallback: Get all shops
    const { data: allShops, error } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .is('deleted_at', null);

    if (error) {
      console.error(`[Orders] Database error fetching shops:`, error);
      return null;
    }

    if (!allShops || allShops.length === 0) {
      console.error(`[Orders] No shops found in database`);
      return null;
    }

    // Look for kitschstudio with normalized matching
    const normalizedSearch = 'kitschstudio';
    for (const shop of allShops) {
      const normalizedDbShopName = shop.shop_name.toLowerCase().replace(/\s+/g, '');
      if (normalizedDbShopName === normalizedSearch) {
        cachedKitschstudioUserId = shop.user_id;
        console.log(`[Orders] ✓ Found kitschstudio shop via normalized match: "${shop.shop_name}" (userId: ${shop.user_id})`);
        return shop.user_id;
      }
    }
    
    // Fallback to first shop
    if (allShops.length > 0) {
      cachedKitschstudioUserId = allShops[0].user_id;
      console.log(`[Orders] ⚠ Using first available shop: "${allShops[0].shop_name}" (userId: ${allShops[0].user_id})`);
      return allShops[0].user_id;
    }

    return null;
  } catch (e) {
    console.error(`[Orders] Error getting kitschstudio userId:`, e);
    return null;
  }
}

/**
 * @route GET /api/orders/public/:orderNumber
 * @desc Get order by order number (public endpoint for order confirmation)
 * @access Public
 */
router.get('/public/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    // Get kitschstudio userId (all orders use the same shop)
    const userId = await getKitschstudioUserId();
    
    if (!userId) {
      return res.status(500).json({
        success: false,
        message: 'Payment service unavailable. Please contact support.'
      });
    }

    // Get order by number
    const order = await ordersService.getOrderByNumber(orderNumber, userId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching public order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route POST /api/orders/public
 * @desc Create a new order (public endpoint for COD and guest checkout)
 * @access Public
 */
router.post('/public', async (req, res) => {
  try {
    const { shopName, ...orderData } = req.body;
    
    console.log(`[Public Order] Order creation request:`, {
      shopName: shopName || '(not provided)',
      hasOrderData: !!orderData.customer_name
    });

    // Get kitschstudio userId (only one shop using this system)
    const userId = await getKitschstudioUserId();
    if (!userId) {
      return res.status(500).json({ 
        success: false, 
        message: 'Order service unavailable. Please contact support.' 
      });
    }
    
    console.log(`[Public Order] Creating order for kitschstudio (userId: ${userId})`);

    if (!orderData.customer_name || !orderData.customer_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name and email are required' 
      });
    }

    const newOrder = await ordersService.createOrder(userId, orderData);
    
    if (!newOrder) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create order' 
      });
    }
    
    // Send HTTP response immediately (don't wait for emails)
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
    
    // Send emails asynchronously after response (non-blocking)
    ordersService.sendOrderEmails(newOrder.id, userId).catch(err => {
      console.error('Background email sending error:', err);
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/orders
 * @desc Create a new order
 * @access Private
 */
router.post('/', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const orderData = req.body;
    
    if (!orderData.customer_name || !orderData.customer_email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name and email are required' 
      });
    }

    const newOrder = await ordersService.createOrder(userId, orderData);
    
    if (!newOrder) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create order' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/orders/:id
 * @desc Update order
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
    const updatedOrder = await ordersService.updateOrder(id, userId, updateData);
    
    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/orders/:id/status
 * @desc Update order status
 * @access Private
 */
router.put('/:id/status', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const updatedOrder = await ordersService.updateOrderStatus(id, userId, status, notes);
    
    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or update failed' 
      });
    }
    // On completion (accrual): post journal entry recognizing revenue and A/R
    try {
      if (String(status).toLowerCase() === 'completed') {
        const fullOrder = await ordersService.getOrderById(id, userId);
        const payload = ordersService.buildJournalFromOrder(fullOrder);
        if (payload && Array.isArray(payload.lines) && payload.lines.length >= 2) {
          const port = process.env.PORT || 3001;
          const url = `http://127.0.0.1:${port}/api/bookkeeping/journal`;
          try {
            const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            // ignore non-2xx silently to avoid blocking status update
            void resp;
          } catch (_) { /* no-op */ }
        }
      }
    } catch (_) { /* non-blocking */ }
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/orders/bulk/status
 * @desc Update multiple orders' status
 * @access Private
 */
router.put('/bulk/status', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { ids, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order IDs array is required' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const success = await ordersService.updateOrdersStatus(ids, userId, status);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update orders' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} order(s) updated successfully`
    });
  } catch (error) {
    console.error('Error updating orders status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/orders/:id
 * @desc Delete order
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

    const success = await ordersService.deleteOrder(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/orders
 * @desc Delete multiple orders
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
        message: 'Order IDs array is required' 
      });
    }

    const success = await ordersService.deleteOrders(ids, userId);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete orders' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} order(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// ORDER ITEMS ROUTES
// ============================================

/**
 * @route GET /api/orders/:id/items
 * @desc Get order items
 * @access Private
 */
router.get('/:id/items', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const items = await ordersService.getOrderItems(id, userId);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/orders/:id/items
 * @desc Add item to order
 * @access Private
 */
router.post('/:id/items', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const itemData = { ...req.body, order_id: id };
    const newItem = await ordersService.addOrderItem(userId, itemData);
    
    if (!newItem) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add item' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item added successfully'
    });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// ORDER NOTES ROUTES
// ============================================

/**
 * @route POST /api/orders/:id/notes
 * @desc Add order note
 * @access Private
 */
router.post('/:id/notes', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const noteData = req.body;
    const newNote = await ordersService.addOrderNote(id, userId, noteData);
    
    if (!newNote) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add note' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newNote,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Error adding order note:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/orders/:id/notes
 * @desc Get order notes
 * @access Private
 */
router.get('/:id/notes', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const notes = await ordersService.getOrderNotes(id, userId);
    
    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching order notes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

