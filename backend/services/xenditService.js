const axios = require('axios');

class XenditService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.xendit.co' 
      : 'https://api.xendit.co'; // Xendit uses same URL for sandbox and live
    
    this.secretKey = process.env.XENDIT_SECRET_KEY;
    this.webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
    
    if (!this.secretKey) {
      console.warn('XENDIT_SECRET_KEY not found in environment variables');
    }
  }

  /**
   * Create QRPH payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} QRPH payment response
   */
  async createQRPHPayment(paymentData) {
    try {
      const { amount, externalId, description, customer } = paymentData;
      
      const payload = {
        reference_id: externalId,
        type: 'DYNAMIC',
        currency: 'PHP',
        amount: amount,
        description: description || 'Payment via QRPH',
        customer: {
          given_names: customer?.firstName || 'Customer',
          email: customer?.email || '',
          mobile_number: customer?.phone || '',
        },
        callback_url: `${process.env.BACKEND_URL}/api/payments/xendit/callback`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      };

      const response = await axios.post(
        `${this.baseURL}/qr_codes`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        qrString: response.data.qr_string,
        qrCodeUrl: response.data.qr_code_url,
      };
    } catch (error) {
      console.error('Error creating QRPH payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Create GCash payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} GCash payment response
   */
  async createGCashPayment(paymentData) {
    try {
      const { amount, externalId, description, customer } = paymentData;
      
      const payload = {
        reference_id: externalId,
        currency: 'PHP',
        amount: amount,
        description: description || 'Payment via GCash',
        customer: {
          given_names: customer?.firstName || 'Customer',
          email: customer?.email || '',
          mobile_number: customer?.phone || '',
        },
        callback_url: `${process.env.BACKEND_URL}/api/payments/xendit/callback`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
        channel_properties: {
          success_redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
          failure_redirect_url: `${process.env.FRONTEND_URL}/payment/failed`,
        },
      };

      const response = await axios.post(
        `${this.baseURL}/ewallets/charges`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        checkoutUrl: response.data.actions?.mobile_web_checkout_url,
        deepLink: response.data.actions?.mobile_deep_link,
      };
    } catch (error) {
      console.error('Error creating GCash payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Create credit/debit card payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Card payment response
   */
  async createCardPayment(paymentData) {
    try {
      const { amount, externalId, description, customer, cardToken } = paymentData;
      
      const payload = {
        token_id: cardToken,
        external_id: externalId,
        amount: amount,
        currency: 'PHP',
        description: description || 'Payment via Credit/Debit Card',
        customer: {
          given_names: customer?.firstName || 'Customer',
          email: customer?.email || '',
          mobile_number: customer?.phone || '',
        },
        callback_url: `${process.env.BACKEND_URL}/api/payments/xendit/callback`,
        redirect_url: `${process.env.FRONTEND_URL}/payment/success`,
      };

      const response = await axios.post(
        `${this.baseURL}/credit_card_charges`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        status: response.data.status,
        authorizationId: response.data.authorization_id,
      };
    } catch (error) {
      console.error('Error creating card payment:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Create card token for secure card storage
   * @param {Object} cardData - Card details
   * @returns {Promise<Object>} Token response
   */
  async createCardToken(cardData) {
    try {
      const { cardNumber, expiryMonth, expiryYear, cvv, isMultipleUse = false } = cardData;
      
      const payload = {
        card_number: cardNumber,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        cvv: cvv,
        is_multiple_use: isMultipleUse,
      };

      const response = await axios.post(
        `${this.baseURL}/credit_card_tokens`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        tokenId: response.data.id,
      };
    } catch (error) {
      console.error('Error creating card token:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Get payment status
   * @param {string} externalId - External payment ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(externalId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${externalId}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error getting payment status:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Webhook signature
   * @param {string} payload - Webhook payload
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(signature, payload) {
    if (!this.webhookToken) {
      console.warn('XENDIT_WEBHOOK_TOKEN not configured');
      return false;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookToken)
      .update(payload)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Process webhook event
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} Processed webhook data
   */
  processWebhookEvent(webhookData) {
    const { event, data } = webhookData || {};
    
    // Handle payment token events (not payment events)
    if (event === 'payment_token.activation' || event?.includes('payment_token')) {
      return {
        event,
        type: 'payment_token',
        tokenId: data?.payment_token_id,
        status: data?.status,
        referenceId: data?.reference_id,
        createdAt: data?.created || new Date().toISOString(),
      };
    }
    
    // Handle Payment Session events (different structure)
    if (event?.includes('payment_session') || event === 'payment.session.completed' || event === 'payment.session.expired') {
      // Payment Session events have the payment data nested differently
      const sessionData = data || webhookData;
      let normalizedStatus = sessionData.status?.toLowerCase() || 'unknown';
      
      if (event.includes('completed') || event.includes('succeeded')) {
        normalizedStatus = 'paid';
      } else if (event.includes('expired') || event.includes('failed')) {
        normalizedStatus = event.includes('expired') ? 'expired' : 'failed';
      }
      
      return {
        event,
        type: 'payment_session',
        paymentId: sessionData.id || sessionData.payment_id || sessionData.payment_request_id,
        sessionId: sessionData.session_id,
        externalId: sessionData.external_id || sessionData.reference_id || sessionData.payment_request_id,
        status: normalizedStatus,
        amount: sessionData.amount || sessionData.requested_amount,
        currency: sessionData.currency || 'PHP',
        paymentMethod: sessionData.payment_method,
        createdAt: sessionData.created || sessionData.created_at,
        updatedAt: sessionData.updated || sessionData.updated_at || new Date().toISOString(),
        customer: sessionData.customer,
        metadata: sessionData.metadata,
      };
    }
    
    // Handle payment events
    if (!data && !webhookData.id) {
      console.warn('Webhook data missing:', webhookData);
      return {
        event: event || 'unknown',
        externalId: null,
        status: 'unknown',
        type: 'unknown',
      };
    }
    
    // Handle direct payment data (some events have data at root level)
    const paymentData = data || webhookData;
    
    // Normalize status for various payment events
    let normalizedStatus = paymentData.status?.toLowerCase() || paymentData.status || 'unknown';
    
    // Handle different event types and status formats
    if (event === 'qr.payment' || event === 'payment.succeeded' || event === 'payment.paid' || 
        event === 'payment.status' || event?.includes('payment.succeeded')) {
      if (paymentData.status === 'SUCCEEDED' || paymentData.status === 'succeeded' || 
          paymentData.status === 'PAID' || paymentData.status === 'paid' ||
          paymentData.status === 'COMPLETED' || paymentData.status === 'completed') {
        normalizedStatus = 'paid';
      } else if (paymentData.status === 'FAILED' || paymentData.status === 'failed') {
        normalizedStatus = 'failed';
      } else if (paymentData.status === 'PENDING' || paymentData.status === 'pending') {
        normalizedStatus = 'pending';
      } else if (paymentData.status === 'EXPIRED' || paymentData.status === 'expired') {
        normalizedStatus = 'expired';
      }
    }
    
    return {
      event,
      paymentId: paymentData.id || paymentData.payment_id,
      externalId: paymentData.external_id || paymentData.reference_id || paymentData.payment_request_id,
      status: normalizedStatus,
      amount: paymentData.amount || paymentData.requested_amount,
      currency: paymentData.currency || 'PHP',
      paymentMethod: paymentData.payment_method,
      createdAt: paymentData.created || paymentData.created_at,
      updatedAt: paymentData.updated || paymentData.updated_at || paymentData.created || new Date().toISOString(),
      customer: paymentData.customer,
      metadata: paymentData.metadata,
    };
  }
}

module.exports = new XenditService();
