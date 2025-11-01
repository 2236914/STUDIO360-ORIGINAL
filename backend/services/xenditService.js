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
    const { event, data } = webhookData;
    
    // Normalize status for QRPH payments (Xendit sends "SUCCEEDED" for QR payments)
    let normalizedStatus = data.status;
    if (event === 'qr.payment' || event === 'payment.succeeded') {
      if (data.status === 'SUCCEEDED' || data.status === 'succeeded') {
        normalizedStatus = 'paid';
      } else if (data.status === 'FAILED' || data.status === 'failed') {
        normalizedStatus = 'failed';
      } else if (data.status === 'PENDING' || data.status === 'pending') {
        normalizedStatus = 'pending';
      }
    }
    
    return {
      event,
      paymentId: data.id,
      externalId: data.external_id || data.reference_id, // QRPH uses reference_id
      status: normalizedStatus,
      amount: data.amount,
      currency: data.currency,
      paymentMethod: data.payment_method || (event === 'qr.payment' ? 'qrph' : null),
      createdAt: data.created,
      updatedAt: data.updated || data.created,
      customer: data.customer,
      metadata: data.metadata,
    };
  }
}

module.exports = new XenditService();
