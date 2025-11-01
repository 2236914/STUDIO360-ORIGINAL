const express = require('express');
const router = express.Router();
const xenditService = require('../../services/xenditService');
const { authenticateTokenHybrid } = require('../../middleware/auth');
const supabase = require('../../services/supabaseClient');
const emailService = require('../../services/emailService');
const ordersService = require('../../services/ordersService');

// ============================================
// XENDIT PAYMENT ROUTES
// ============================================

/**
 * @route GET /api/payments/xendit/test
 * @desc Test endpoint to verify route is accessible
 * @access Public
 */
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Xendit routes are working!',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route POST /api/payments/xendit/qrph
 * @desc Create QRPH payment
 * @access Private
 */
router.post('/qrph', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, description, customer, orderId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }

    const externalId = `qrph_${Date.now()}_${userId}`;
    
    const paymentData = {
      amount,
      externalId,
      description,
      customer,
      orderId,
    };

    const result = await xenditService.createQRPHPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create QRPH payment',
        error: result.error 
      });
    }

    // Store payment record in database
    const { data: paymentRecord, error } = await supabase
      .from('xendit_payments')
      .insert([{
        user_id: userId,
        external_id: externalId,
        payment_method: 'qrph',
        amount: amount,
        currency: 'PHP',
        status: 'pending',
        order_id: orderId,
        xendit_data: result.data,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing payment record:', error);
    }

    res.status(201).json({
      success: true,
      data: {
        paymentId: paymentRecord?.id,
        externalId,
        qrString: result.qrString,
        qrCodeUrl: result.qrCodeUrl,
        amount,
        expiresAt: result.data.expires_at,
      },
      message: 'QRPH payment created successfully'
    });
  } catch (error) {
    console.error('Error creating QRPH payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/payments/xendit/gcash
 * @desc Create GCash payment
 * @access Private
 */
router.post('/gcash', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, description, customer, orderId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }

    const externalId = `gcash_${Date.now()}_${userId}`;
    
    const paymentData = {
      amount,
      externalId,
      description,
      customer,
      orderId,
    };

    const result = await xenditService.createGCashPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create GCash payment',
        error: result.error 
      });
    }

    // Store payment record in database
    const { data: paymentRecord, error } = await supabase
      .from('xendit_payments')
      .insert([{
        user_id: userId,
        external_id: externalId,
        payment_method: 'gcash',
        amount: amount,
        currency: 'PHP',
        status: 'pending',
        order_id: orderId,
        xendit_data: result.data,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing payment record:', error);
    }

    res.status(201).json({
      success: true,
      data: {
        paymentId: paymentRecord?.id,
        externalId,
        checkoutUrl: result.checkoutUrl,
        deepLink: result.deepLink,
        amount,
      },
      message: 'GCash payment created successfully'
    });
  } catch (error) {
    console.error('Error creating GCash payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/payments/xendit/card
 * @desc Create credit/debit card payment
 * @access Private
 */
router.post('/card', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, description, customer, orderId, cardToken } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid amount is required' 
      });
    }

    if (!cardToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Card token is required' 
      });
    }

    const externalId = `card_${Date.now()}_${userId}`;
    
    const paymentData = {
      amount,
      externalId,
      description,
      customer,
      orderId,
      cardToken,
    };

    const result = await xenditService.createCardPayment(paymentData);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create card payment',
        error: result.error 
      });
    }

    // Store payment record in database
    const { data: paymentRecord, error } = await supabase
      .from('xendit_payments')
      .insert([{
        user_id: userId,
        external_id: externalId,
        payment_method: 'card',
        amount: amount,
        currency: 'PHP',
        status: result.status || 'pending',
        order_id: orderId,
        xendit_data: result.data,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error storing payment record:', error);
    }

    res.status(201).json({
      success: true,
      data: {
        paymentId: paymentRecord?.id,
        externalId,
        status: result.status,
        authorizationId: result.authorizationId,
        amount,
      },
      message: 'Card payment created successfully'
    });
  } catch (error) {
    console.error('Error creating card payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route POST /api/payments/xendit/card-token
 * @desc Create card token for secure storage
 * @access Private
 */
router.post('/card-token', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cardNumber, expiryMonth, expiryYear, cvv, isMultipleUse } = req.body;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({ 
        success: false, 
        message: 'All card details are required' 
      });
    }

    const cardData = {
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      isMultipleUse: isMultipleUse || false,
    };

    const result = await xenditService.createCardToken(cardData);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to create card token',
        error: result.error 
      });
    }

    res.status(201).json({
      success: true,
      data: {
        tokenId: result.tokenId,
      },
      message: 'Card token created successfully'
    });
  } catch (error) {
    console.error('Error creating card token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/payments/xendit/status/:externalId
 * @desc Get payment status
 * @access Private
 */
router.get('/status/:externalId', authenticateTokenHybrid, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { externalId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    const result = await xenditService.getPaymentStatus(externalId);
    
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to get payment status',
        error: result.error 
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      message: 'Payment status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

/**
 * @route GET /api/payments/xendit/callback
 * @desc Test endpoint to verify callback route is accessible
 * @access Public
 */
router.get('/callback', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Xendit callback endpoint is accessible',
    timestamp: new Date().toISOString(),
    note: 'This endpoint should receive POST requests from Xendit webhooks'
  });
});

/**
 * @route POST /api/payments/xendit/callback
 * @desc Handle Xendit webhook callbacks
 * @access Public (Xendit webhook)
 */
router.post('/callback', async (req, res) => {
  try {
    console.log('Xendit webhook received:', {
      method: req.method,
      path: req.path,
      headers: Object.keys(req.headers),
      bodyKeys: Object.keys(req.body || {}),
      timestamp: new Date().toISOString()
    });

    const signature = req.headers['x-xendit-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature (skip in test mode if no signature provided)
    if (signature && !xenditService.verifyWebhookSignature(signature, payload)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid signature' 
      });
    }
    
    // Allow test calls without signature for initial setup
    if (!signature && process.env.NODE_ENV === 'production') {
      console.warn('Webhook received without signature in production');
      // Still process but log warning
    }

    const webhookData = xenditService.processWebhookEvent(req.body);
    
    // Handle payment_token events separately (just acknowledge, don't process)
    if (webhookData.type === 'payment_token') {
      console.log('Payment token event received:', webhookData.event);
      return res.status(200).json({ 
        success: true, 
        message: 'Payment token event acknowledged',
        event: webhookData.event
      });
    }
    
    // Update payment status in database (try both external_id and reference_id for QRPH compatibility)
    let updatedPayment = null;
    let error = null;
    
    if (webhookData.externalId) {
      const result = await supabase
        .from('xendit_payments')
        .update({
          status: webhookData.status,
          xendit_data: req.body.data,
          updated_at: new Date().toISOString(),
        })
        .eq('external_id', webhookData.externalId)
        .select()
        .single();
      updatedPayment = result.data;
      error = result.error;
      
      // If not found by external_id, try reference_id (for QRPH)
      if (error && req.body.data?.reference_id) {
        const result2 = await supabase
          .from('xendit_payments')
          .update({
            status: webhookData.status,
            xendit_data: req.body.data,
            updated_at: new Date().toISOString(),
          })
          .eq('external_id', req.body.data.reference_id)
          .select()
          .single();
        updatedPayment = result2.data;
        error = result2.error;
      }
    }

    if (error) {
      console.error('Error updating payment status:', error);
    }

    // Update order status if payment is successful
    if (webhookData.status === 'paid' && updatedPayment?.order_id) {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedPayment.order_id);

      if (orderError) {
        console.error('Error updating order status:', orderError);
      } else {
        // Auto-post cash receipt to clear A/R (accrual basis) using bookkeeping endpoint
        try {
          const { data: orderData } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', updatedPayment.order_id)
            .single();
          if (orderData) {
            try {
              const receiptPayload = ordersService.buildReceiptFromOrder(orderData, updatedPayment.amount);
              if (receiptPayload) {
                const port = process.env.PORT || 3001;
                const url = `http://127.0.0.1:${port}/api/bookkeeping/cash-receipts`;
                try { await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(receiptPayload) }); } catch (_) {}
              }
            } catch (postErr) { /* ignore to not fail webhook */ }
          }
        } catch (_) { /* ignore */ }
        // Send order confirmation email to customer
        try {
          const { data: orderData } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', updatedPayment.order_id)
            .single();

          if (orderData && orderData.customer_email) {
            const emailData = {
              orderId: orderData.id,
              orderNumber: orderData.order_number,
              customerName: orderData.customer_name,
              customerEmail: orderData.customer_email,
              orderDate: new Date(orderData.order_date || orderData.created_at).toLocaleDateString(),
              orderItems: orderData.order_items || [],
              orderTotal: `$${orderData.total?.toFixed(2) || '0.00'}`,
              shippingAddress: `${orderData.shipping_street || ''}, ${orderData.shipping_city || ''}, ${orderData.shipping_province || ''} ${orderData.shipping_zip_code || ''}`.trim()
            };
            await emailService.sendOrderConfirmation(orderData.user_id, emailData);
            console.log('✅ Order confirmation email sent');
          }
        } catch (emailError) {
          console.error('Error sending order confirmation email:', emailError);
          // Don't fail webhook processing if email fails
        }
      }
    }

    console.log('Webhook processed successfully:', webhookData);
    
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

module.exports = router;
