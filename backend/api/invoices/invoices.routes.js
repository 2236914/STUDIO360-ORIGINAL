const express = require('express');
const router = express.Router();
const invoicesService = require('../../services/invoicesService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

// ============================================
// INVOICE ROUTES
// ============================================

/**
 * @route GET /api/invoices
 * @desc Get all invoices with optional filters
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
      status: req.query.status,
      service: req.query.service ? req.query.service.split(',') : [],
      search: req.query.search,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const invoices = await invoicesService.getInvoices(userId, filters);
    
    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/invoices/stats
 * @desc Get invoice statistics
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

    const stats = await invoicesService.getInvoiceStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/invoices/:id
 * @desc Get invoice by ID
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

    const invoice = await invoicesService.getInvoiceById(id, userId);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/invoices/number/:invoiceNumber
 * @desc Get invoice by invoice number
 * @access Private
 */
router.get('/number/:invoiceNumber', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { invoiceNumber } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const invoice = await invoicesService.getInvoiceByNumber(invoiceNumber, userId);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found' 
      });
    }
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/invoices
 * @desc Create a new invoice
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

    const invoiceData = req.body;
    
    if (!invoiceData.invoice_from_name || !invoiceData.invoice_to_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'From and To information are required' 
      });
    }

    const newInvoice = await invoicesService.createInvoice(userId, invoiceData);
    
    if (!newInvoice) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create invoice' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newInvoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/invoices/:id
 * @desc Update invoice
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
    const updatedInvoice = await invoicesService.updateInvoice(id, userId, updateData);
    
    if (!updatedInvoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/invoices/:id/status
 * @desc Update invoice status
 * @access Private
 */
router.put('/:id/status', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;
    
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

    const updatedInvoice = await invoicesService.updateInvoiceStatus(id, userId, status);
    
    if (!updatedInvoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice status updated successfully'
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route PUT /api/invoices/:id/send
 * @desc Mark invoice as sent
 * @access Private
 */
router.put('/:id/send', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const updatedInvoice = await invoicesService.markInvoiceAsSent(id, userId);
    
    if (!updatedInvoice) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or update failed' 
      });
    }
    
    res.json({
      success: true,
      data: updatedInvoice,
      message: 'Invoice marked as sent'
    });
  } catch (error) {
    console.error('Error marking invoice as sent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/invoices/:id
 * @desc Delete invoice
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

    const success = await invoicesService.deleteInvoice(id, userId);
    
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not found or delete failed' 
      });
    }
    
    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route DELETE /api/invoices
 * @desc Delete multiple invoices
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
        message: 'Invoice IDs array is required' 
      });
    }

    const success = await invoicesService.deleteInvoices(ids, userId);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete invoices' 
      });
    }
    
    res.json({
      success: true,
      message: `${ids.length} invoice(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting invoices:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// INVOICE ITEMS ROUTES
// ============================================

/**
 * @route GET /api/invoices/:id/items
 * @desc Get invoice items
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

    const items = await invoicesService.getInvoiceItems(id, userId);
    
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ============================================
// INVOICE PAYMENTS ROUTES
// ============================================

/**
 * @route POST /api/invoices/:id/payments
 * @desc Add payment to invoice
 * @access Private
 */
router.post('/:id/payments', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const paymentData = { ...req.body, invoice_id: id };
    const newPayment = await invoicesService.addInvoicePayment(userId, paymentData);
    
    if (!newPayment) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to add payment' 
      });
    }
    
    res.status(201).json({
      success: true,
      data: newPayment,
      message: 'Payment added successfully'
    });
  } catch (error) {
    console.error('Error adding invoice payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/invoices/:id/payments
 * @desc Get invoice payments
 * @access Private
 */
router.get('/:id/payments', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const payments = await invoicesService.getInvoicePayments(id, userId);
    
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;

