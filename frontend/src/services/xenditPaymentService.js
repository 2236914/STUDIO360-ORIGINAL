import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class XenditPaymentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/api/payments/xendit`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Create QRPH payment
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} QRPH payment response
   */
  async createQRPHPayment(paymentData) {
    try {
      const response = await this.apiClient.post('/qrph', paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating QRPH payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
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
      const response = await this.apiClient.post('/gcash', paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating GCash payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
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
      const response = await this.apiClient.post('/card', paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating card payment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
      };
    }
  }

  /**
   * Create card token for secure storage
   * @param {Object} cardData - Card details
   * @returns {Promise<Object>} Token response
   */
  async createCardToken(cardData) {
    try {
      const response = await this.apiClient.post('/card-token', cardData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating card token:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
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
      const response = await this.apiClient.get(`/status/${externalId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error getting payment status:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        data: error.response?.data,
      };
    }
  }

  /**
   * Process payment based on method
   * @param {string} method - Payment method (qrph, gcash, card)
   * @param {Object} paymentData - Payment details
   * @returns {Promise<Object>} Payment response
   */
  async processPayment(method, paymentData) {
    switch (method.toLowerCase()) {
      case 'qrph':
        return await this.createQRPHPayment(paymentData);
      case 'gcash':
        return await this.createGCashPayment(paymentData);
      case 'card':
        return await this.createCardPayment(paymentData);
      default:
        return {
          success: false,
          error: 'Unsupported payment method',
        };
    }
  }

  /**
   * Format payment data for API
   * @param {Object} orderData - Order information
   * @param {Object} customerData - Customer information
   * @param {string} method - Payment method
   * @returns {Object} Formatted payment data
   */
  formatPaymentData(orderData, customerData, method) {
    return {
      amount: orderData.total || orderData.amount,
      description: `Payment for order ${orderData.id || 'unknown'}`,
      customer: {
        firstName: customerData.firstName || customerData.name?.split(' ')[0] || 'Customer',
        lastName: customerData.lastName || customerData.name?.split(' ').slice(1).join(' ') || '',
        email: customerData.email || '',
        phone: customerData.phone || customerData.phoneNumber || '',
      },
      orderId: orderData.id,
    };
  }

  /**
   * Poll payment status until completion
   * @param {string} externalId - External payment ID
   * @param {number} maxAttempts - Maximum polling attempts
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<Object>} Final payment status
   */
  async pollPaymentStatus(externalId, maxAttempts = 30, interval = 2000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getPaymentStatus(externalId);
      
      if (result.success) {
        const status = result.data.status;
        
        // Check if payment is in final state
        if (['paid', 'failed', 'expired', 'cancelled'].includes(status)) {
          return result;
        }
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return {
      success: false,
      error: 'Payment status polling timeout',
    };
  }
}

// Create singleton instance
const xenditPaymentService = new XenditPaymentService();

export default xenditPaymentService;
