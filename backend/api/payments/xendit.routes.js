const express = require('express');
const router = express.Router();
const xenditService = require('../../services/xenditService');
const { authenticateTokenHybrid } = require('../../middleware/auth');
const { supabase } = require('../../services/supabaseClient');
const emailService = require('../../services/emailService');
const ordersService = require('../../services/ordersService');

/**
 * Get the default kitschstudio user_id (since all Xendit API keys are for kitschstudio)
 * This is cached to avoid repeated database queries
 */
let cachedKitschstudioUserId = null;

async function getKitschstudioUserId() {
  // Return cached value if available
  if (cachedKitschstudioUserId) {
    return cachedKitschstudioUserId;
  }

  try {
    console.log(`[Xendit Payment] Looking up kitschstudio shop in database...`);
    
    // Check if supabase client is available
    if (!supabase) {
      console.error(`[Xendit Payment] Supabase client is not initialized`);
      return null;
    }
    
    // Try exact match first (shop name is "kitschstudio" in database)
    const { data: exactMatch, error: exactError } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .eq('shop_name', 'kitschstudio')
      .is('deleted_at', null)
      .maybeSingle();

    if (!exactError && exactMatch) {
      cachedKitschstudioUserId = exactMatch.user_id;
      console.log(`[Xendit Payment] ✓ Found kitschstudio shop via exact match: "${exactMatch.shop_name}" (userId: ${exactMatch.user_id})`);
      return exactMatch.user_id;
    }

    // Fallback: Try case-insensitive match
    const { data: caseInsensitiveMatch, error: caseError } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .ilike('shop_name', 'kitschstudio')
      .is('deleted_at', null)
      .maybeSingle();

    if (!caseError && caseInsensitiveMatch) {
      cachedKitschstudioUserId = caseInsensitiveMatch.user_id;
      console.log(`[Xendit Payment] ✓ Found kitschstudio shop via case-insensitive match: "${caseInsensitiveMatch.shop_name}" (userId: ${caseInsensitiveMatch.user_id})`);
      return caseInsensitiveMatch.user_id;
    }

    // Fallback: Get all shops and find by normalization
    const { data: allShops, error: allError } = await supabase
      .from('shop_info')
      .select('user_id, shop_name')
      .is('deleted_at', null);

    if (allError) {
      console.error(`[Xendit Payment] Database error fetching shops:`, allError);
      return null;
    }

    if (!allShops || allShops.length === 0) {
      console.error(`[Xendit Payment] No shops found in database. Please ensure shop_info table has at least one shop.`);
      return null;
    }

    console.log(`[Xendit Payment] Found ${allShops.length} shop(s) in database:`, allShops.map(s => `"${s.shop_name}"`).join(', '));

    // Look for kitschstudio with normalized matching (lowercase, remove spaces)
    const normalizedSearch = 'kitschstudio';
    for (const shop of allShops) {
      const normalizedDbShopName = shop.shop_name.toLowerCase().replace(/\s+/g, '');
      console.log(`[Xendit Payment] Checking shop: "${shop.shop_name}" (normalized: "${normalizedDbShopName}")`);
      
      if (normalizedDbShopName === normalizedSearch) {
        cachedKitschstudioUserId = shop.user_id;
        console.log(`[Xendit Payment] ✓ Found kitschstudio shop via normalized match: "${shop.shop_name}" (userId: ${shop.user_id})`);
        return shop.user_id;
      }
    }

    // Final fallback: Use first shop (since all API keys are for kitschstudio anyway)
    if (allShops.length > 0) {
      cachedKitschstudioUserId = allShops[0].user_id;
      console.log(`[Xendit Payment] ⚠ Kitschstudio not found exactly, using first available shop as fallback: "${allShops[0].shop_name}" (userId: ${allShops[0].user_id})`);
      return allShops[0].user_id;
    }

    console.error(`[Xendit Payment] No shops found in database`);
    return null;
  } catch (e) {
    console.error(`[Xendit Payment] Exception getting kitschstudio userId:`, e);
    console.error(`[Xendit Payment] Error stack:`, e.stack);
    return null;
  }
}

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
 * @route POST /api/payments/xendit/public/qrph
 * @desc Create QRPH payment (public endpoint using shop name)
 * @access Public
 */
router.post('/public/qrph', async (req, res) => {
  try {
    const { shopName, amount, description, customer, orderId } = req.body;
    
    console.log(`[Xendit Payment] QRPH request received:`, {
      shopName: shopName || '(not provided)',
      amount,
      bodyKeys: Object.keys(req.body)
    });

    // Get kitschstudio userId (all API keys are for kitschstudio)
    const userId = await getKitschstudioUserId();
    if (!userId) {
      console.error(`[Xendit Payment] Failed to get userId for QRPH payment`);
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service configuration error. Please contact support.' 
      });
    }
    
    console.log(`[Xendit Payment] Processing QRPH payment (userId: ${userId})`);

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
 * @route POST /api/payments/xendit/public/gcash
 * @desc Create GCash payment (public endpoint using shop name)
 * @access Public
 */
router.post('/public/gcash', async (req, res) => {
  try {
    const { shopName, amount, description, customer, orderId } = req.body;
    
    console.log(`[Xendit Payment] GCash request received:`, {
      shopName: shopName || '(not provided)',
      amount,
      bodyKeys: Object.keys(req.body)
    });

    // Get kitschstudio userId (all API keys are for kitschstudio)
    const userId = await getKitschstudioUserId();
    if (!userId) {
      console.error(`[Xendit Payment] Failed to get userId for GCash payment`);
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service configuration error. Please contact support.' 
      });
    }
    
    console.log(`[Xendit Payment] Processing GCash payment (userId: ${userId})`);

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
 * @route POST /api/payments/xendit/public/card
 * @desc Create credit/debit card payment (public endpoint using shop name)
 * @access Public
 */
router.post('/public/card', async (req, res) => {
  try {
    const { shopName, amount, description, customer, orderId, cardToken } = req.body;
    
    console.log(`[Xendit Payment] Card request received:`, {
      shopName: shopName || '(not provided)',
      amount,
      hasCardToken: !!cardToken,
      bodyKeys: Object.keys(req.body)
    });

    // Get kitschstudio userId (all API keys are for kitschstudio)
    const userId = await getKitschstudioUserId();
    if (!userId) {
      console.error(`[Xendit Payment] Failed to get userId for card payment`);
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service configuration error. Please contact support.' 
      });
    }
    
    console.log(`[Xendit Payment] Processing Card payment (userId: ${userId})`);

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
 * @route POST /api/payments/xendit/public/card-token
 * @desc Create card token for secure storage (public endpoint using shop name)
 * @access Public
 */
router.post('/public/card-token', async (req, res) => {
  try {
    const { shopName, cardNumber, expiryMonth, expiryYear, cvv, isMultipleUse } = req.body;
    
    console.log(`[Xendit Payment] Card token request received:`, {
      shopName: shopName || '(not provided)',
      hasCardNumber: !!cardNumber,
      bodyKeys: Object.keys(req.body)
    });

    // Get kitschstudio userId (all API keys are for kitschstudio)
    // Note: userId is not actually needed for token creation, but we validate it exists
    const userId = await getKitschstudioUserId();
    if (!userId) {
      console.error(`[Xendit Payment] Failed to get userId for card token`);
      return res.status(500).json({ 
        success: false, 
        message: 'Payment service configuration error. Please contact support.' 
      });
    }
    
    console.log(`[Xendit Payment] Processing card token (userId: ${userId})`);

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
 * @note This endpoint receives raw body via server.js middleware for signature verification
 */
router.post('/callback', async (req, res) => {
  // Set timeout to prevent hanging (Xendit expects response within 30s)
  req.setTimeout(25000); // 25 seconds to be safe
  
  // Add safety timeout - if handler takes too long, respond anyway
  const responseTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.warn('Webhook response timeout - sending default response');
      res.status(200).json({ 
        success: true, 
        message: 'Webhook received and queued for processing',
        timestamp: new Date().toISOString()
      });
    }
  }, 20000); // 20 seconds
  
  try {
    // Get raw body for signature verification
    // Handle both Buffer and string formats
    let rawBody;
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString('utf8');
    } else if (typeof req.body === 'string') {
      rawBody = req.body;
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Body was already parsed as JSON, stringify it back
      rawBody = JSON.stringify(req.body);
    } else {
      clearTimeout(responseTimeout);
      console.error('Unexpected body type:', typeof req.body);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request body format' 
      });
    }
    
    // Parse JSON body for processing
    let webhookBody;
    try {
      if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        // Body already parsed (shouldn't happen with raw middleware, but handle it)
        webhookBody = req.body;
      } else {
        webhookBody = JSON.parse(rawBody);
      }
    } catch (parseError) {
      clearTimeout(responseTimeout);
      console.error('Failed to parse webhook body as JSON:', parseError.message);
      console.error('Body type:', typeof req.body, 'Is Buffer:', Buffer.isBuffer(req.body));
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid JSON payload',
        error: process.env.NODE_ENV === 'development' ? parseError.message : undefined
      });
    }

    // Xendit uses different headers for different webhook types
    const signature = req.headers['x-xendit-signature'] || req.headers['x-xendit-signature-v2'];
    const callbackToken = req.headers['x-callback-token'] || req.headers['X-CALLBACK-TOKEN'];
    
    console.log('Xendit webhook received:', {
      method: req.method,
      path: req.path,
      hasSignature: !!signature,
      hasCallbackToken: !!callbackToken,
      event: webhookBody?.event,
      bodyKeys: Object.keys(webhookBody || {}),
      timestamp: new Date().toISOString()
    });
    
    // Verify webhook using signature or callback token
    if (signature) {
      const isValid = xenditService.verifyWebhookSignature(signature, rawBody);
      if (!isValid) {
        clearTimeout(responseTimeout);
        console.error('Invalid webhook signature', {
          signature: signature?.substring(0, 20) + '...',
          hasWebhookToken: !!process.env.XENDIT_WEBHOOK_TOKEN
        });
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid signature' 
        });
      }
      console.log('✅ Webhook signature verified');
    } else if (callbackToken) {
      // Verify callback token matches webhook token
      if (process.env.XENDIT_WEBHOOK_TOKEN && callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
        clearTimeout(responseTimeout);
        console.error('Invalid callback token');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid callback token' 
        });
      }
      console.log('✅ Callback token verified');
    } else {
      // Warn in production if no verification headers
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Webhook received without verification headers in production');
      } else {
        console.log('ℹ️ Webhook received without verification (development/test mode)');
      }
    }

    const webhookData = xenditService.processWebhookEvent(webhookBody);
    
    // Handle payment_token events separately (just acknowledge, don't process)
    if (webhookData.type === 'payment_token') {
      clearTimeout(responseTimeout);
      console.log('Payment token event received:', webhookData.event);
      return res.status(200).json({ 
        success: true, 
        message: 'Payment token event acknowledged',
        event: webhookData.event
      });
    }
    
    // Handle payment_capture events (Payment Status API v3)
    if (webhookData.type === 'payment_capture') {
      console.log('Payment capture event received:', {
        event: webhookData.event,
        status: webhookData.status,
        externalId: webhookData.externalId,
        paymentId: webhookData.paymentId
      });
      // Continue to payment update logic below
    }
    
    // Handle payment_session events - acknowledge even if no matching payment record
    if (webhookData.type === 'payment_session') {
      console.log('Payment session event received:', {
        event: webhookData.event,
        status: webhookData.status,
        externalId: webhookData.externalId,
        sessionId: webhookData.sessionId
      });
      
      // Try to update payment if we can find it, but don't fail if we can't
      if (webhookData.externalId) {
        // Continue to payment update logic below
      } else {
        // No externalId found, just acknowledge immediately
        clearTimeout(responseTimeout);
        return res.status(200).json({
          success: true,
          message: 'Payment session event acknowledged',
          event: webhookData.event,
          status: webhookData.status
        });
      }
    }
    
    // Update payment status in database (try both external_id and reference_id for QRPH compatibility)
    let updatedPayment = null;
    let error = null;
    
    if (webhookData.externalId) {
      const result = await supabase
        .from('xendit_payments')
        .update({
          status: webhookData.status,
          xendit_data: webhookBody.data || webhookBody,
          updated_at: new Date().toISOString(),
        })
        .eq('external_id', webhookData.externalId)
        .select()
        .single();
      updatedPayment = result.data;
      error = result.error;
      
      // If not found by external_id, try reference_id (for QRPH)
      if (error && (webhookBody.data?.reference_id || webhookBody.reference_id)) {
        const referenceId = webhookBody.data?.reference_id || webhookBody.reference_id;
        console.log('Trying to find payment by reference_id:', referenceId);
        const result2 = await supabase
          .from('xendit_payments')
          .update({
            status: webhookData.status,
            xendit_data: webhookBody.data || webhookBody,
            updated_at: new Date().toISOString(),
          })
          .eq('external_id', referenceId)
          .select()
          .single();
        updatedPayment = result2.data;
        error = result2.error;
      }
    } else {
      console.warn('No externalId found in webhook data:', {
        event: webhookData.event,
        type: webhookData.type,
        paymentId: webhookData.paymentId,
        sessionId: webhookData.sessionId,
        referenceId: webhookBody.data?.reference_id || webhookBody.reference_id,
        webhookBodyKeys: Object.keys(webhookBody || {})
      });
      
      // For payment session events without externalId, still acknowledge success immediately
      if (webhookData.type === 'payment_session' || webhookData.type === 'payment_capture') {
        clearTimeout(responseTimeout);
        // Acknowledge immediately to prevent timeout
        res.status(200).json({
          success: true,
          message: `${webhookData.type} event acknowledged (no matching payment record)`,
          event: webhookData.event,
          status: webhookData.status
        });
        
        // Log for investigation
        console.warn('Webhook processed but no payment record found:', {
          type: webhookData.type,
          event: webhookData.event,
          externalId: webhookData.externalId,
          paymentId: webhookData.paymentId
        });
        return;
      }
    }

    if (error && !updatedPayment) {
      console.error('Error updating payment status:', error);
      // Still return success to Xendit to prevent retries if it's just a DB issue
      // Log the issue for manual investigation
      console.warn('Payment record not found or update failed:', {
        externalId: webhookData.externalId,
        event: webhookData.event,
        status: webhookData.status
      });
    }

    // Update order status based on payment result
    if (updatedPayment?.order_id) {
      if (webhookData.status === 'paid') {
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
          // Process async operations in background (don't await - respond immediately)
          // This prevents webhook timeout issues
          setImmediate(async () => {
            try {
              // Auto-post cash receipt to clear A/R (accrual basis) using bookkeeping endpoint
              const { data: orderData } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', updatedPayment.order_id)
                .single();
              
              if (orderData) {
                try {
                  const receiptPayload = ordersService.buildReceiptFromOrder(orderData, updatedPayment.amount);
                  if (receiptPayload) {
                    // Use BACKEND_URL if available, otherwise construct URL
                    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
                    const url = `${baseUrl}/api/bookkeeping/cash-receipts`;
                    try {
                      // Use AbortController for timeout
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 10000);
                      
                      await fetch(url, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(receiptPayload),
                        signal: controller.signal
                      });
                      
                      clearTimeout(timeoutId);
                    } catch (fetchErr) {
                      if (fetchErr.name === 'AbortError') {
                        console.error('Cash receipt request timed out');
                      } else {
                        console.error('Error posting cash receipt:', fetchErr.message);
                      }
                    }
                  }
                } catch (postErr) {
                  console.error('Error building receipt payload:', postErr.message);
                }
              }
            } catch (err) {
              console.error('Error fetching order data for receipt:', err.message);
            }
            
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
              console.error('Error sending order confirmation email:', emailError.message);
            }
          });
        }
      } else if (webhookData.status === 'failed' || webhookData.status === 'expired') {
        // Update order status for failed/expired payments
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedPayment.order_id);

        if (orderError) {
          console.error('Error updating order status for failed payment:', orderError);
        } else {
          console.log('Order payment status updated to failed');
        }
      }
    }

    console.log('✅ Webhook processed successfully:', {
      event: webhookData.event,
      status: webhookData.status,
      externalId: webhookData.externalId,
      paymentUpdated: !!updatedPayment
    });
    
    clearTimeout(responseTimeout);
    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      event: webhookData.event,
      status: webhookData.status
    });
  } catch (error) {
    clearTimeout(responseTimeout);
    
    console.error('Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Ensure we always send a response - even if there's an error
    // This prevents 502 Bad Gateway errors
    if (!res.headersSent) {
      try {
        // For webhook errors, it's better to return 200 to prevent Xendit retries
        // Log the error but acknowledge receipt
        res.status(200).json({ 
          success: true, 
          message: 'Webhook received (processing error logged)',
          timestamp: new Date().toISOString(),
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      } catch (sendError) {
        console.error('Failed to send error response:', sendError);
        // Last resort - try to send plain text
        try {
          if (!res.headersSent) {
            res.status(200).end('OK');
          }
        } catch (_) {
          // If all else fails, at least log it
          console.error('Complete failure to send response');
        }
      }
    }
  }
});

module.exports = router;
