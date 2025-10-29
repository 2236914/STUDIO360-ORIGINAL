const express = require('express');
const router = express.Router();
const emailPreferencesService = require('../../services/emailPreferencesService');
const emailService = require('../../services/emailService');
const { authenticateTokenHybrid } = require('../../middleware/auth');

/**
 * @route GET /api/notifications/preferences
 * @desc Get user email preferences
 * @access Private
 */
router.get('/preferences', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const preferences = await emailPreferencesService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences,
      message: 'Email preferences retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting email preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user email preferences
 * @access Private
 */
router.put('/preferences', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const preferences = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const updated = await emailPreferencesService.setPreferences(userId, preferences);

    res.json({
      success: true,
      data: updated,
      message: 'Email preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route POST /api/notifications/test
 * @desc Send a test email
 * @access Private
 */
router.post('/test', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { email, testType } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Send test email based on type
    let emailData;
    switch (testType) {
      case 'order_confirmation':
        emailData = {
          orderId: 'test-123',
          orderNumber: 'TEST-12345',
          customerName: 'Test User',
          customerEmail: email,
          orderDate: new Date().toLocaleDateString(),
          orderItems: [{ name: 'Test Product', quantity: 1, price: '$99.99' }],
          orderTotal: '$99.99',
          shippingAddress: '123 Test Street, Test City, Test Province 12345'
        };
        await emailService.sendOrderConfirmation(userId, emailData);
        break;
      
      case 'order_status_update':
        emailData = {
          orderNumber: 'TEST-12345',
          customerName: 'Test User',
          customerEmail: email,
          orderStatus: 'Shipped',
          trackingNumber: 'TRACK123456',
          notes: 'Your order has been shipped successfully!'
        };
        await emailService.sendOrderStatusUpdate(userId, emailData);
        break;

      case 'new_order_alert':
        emailData = {
          orderId: 'test-123',
          orderNumber: 'TEST-12345',
          customerName: 'Test Customer',
          customerEmail: 'test@example.com',
          orderDate: new Date().toLocaleDateString(),
          orderItems: [{ name: 'Test Product', quantity: 2, price: '$99.99' }],
          orderTotal: '$199.98',
          sellerEmail: email,
          sellerName: 'Test Seller'
        };
        await emailService.sendNewOrderAlert(userId, emailData);
        break;

      case 'low_stock_alert':
        emailData = {
          productId: 'test-product-123',
          productName: 'Test Product',
          currentStock: 5,
          minStockLevel: 10,
          ownerEmail: email,
          ownerName: 'Test Seller'
        };
        await emailService.sendLowStockAlert(userId, emailData);
        break;

      default:
        // Send a simple test email
        const result = await emailService.sendEmail({
          to: email,
          subject: 'Test Email from STUDIO360',
          html: `
            <h2>Test Email</h2>
            <p>This is a test email from your STUDIO360 account.</p>
            <p>If you received this email, your email configuration is working correctly.</p>
          `,
          text: 'This is a test email from your STUDIO360 account. If you received this email, your email configuration is working correctly.'
        });
        return res.json({
          success: result.success,
          message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
          data: result
        });
    }

    res.json({
      success: true,
      message: `${testType || 'Test'} email sent successfully`
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/notifications/history
 * @desc Get email notification history
 * @access Private
 */
router.get('/history', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const filters = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const history = await emailPreferencesService.getNotificationHistory(userId, filters);

    res.json({
      success: true,
      data: history,
      message: 'Notification history retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

