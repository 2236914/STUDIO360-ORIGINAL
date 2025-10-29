const express = require('express');
const router = express.Router();
const ordersService = require('../../services/ordersService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

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

