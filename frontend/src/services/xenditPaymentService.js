import axios from 'axios';
import { CONFIG } from 'src/config-global';

class XenditPaymentService {
  constructor() {
    const API_BASE_URL = CONFIG.site.serverUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/api/payments/xendit`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests (use Supabase session if available)
    // Skip auth for public endpoints (those with /public/ in path)
    this.apiClient.interceptors.request.use(async (config) => {
      // Skip auth for public endpoints
      if (config.url?.includes('/public/')) {
        return config;
      }
      
      try {
        // Try to get Supabase session first
        const { supabase } = await import('src/auth/context/jwt/supabaseClient');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
          return config;
        }
      } catch (err) {
        // Fallback to localStorage token
      }
      
      // Fallback to localStorage token
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    
    // Handle errors better
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        // If connection refused, provide better error message
        if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
          error.message = 'Cannot connect to payment server. Please check your connection or contact support.';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create QRPH payment
   * @param {Object} paymentData - Payment details (should include shopName for public endpoint)
   * @returns {Promise<Object>} QRPH payment response
   */
  async createQRPHPayment(paymentData) {
    try {
      // Use public endpoint if shopName is provided, otherwise use authenticated endpoint
      const endpoint = paymentData.shopName ? '/public/qrph' : '/qrph';
      const response = await this.apiClient.post(endpoint, paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating QRPH payment:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Failed to create QRPH payment';
      
      // Handle connection errors specifically
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to payment server. Please check if the backend server is running.';
      }
      
      return {
        success: false,
        error: errorMessage,
        data: error.response?.data,
      };
    }
  }

  /**
   * Create GCash payment
   * @param {Object} paymentData - Payment details (should include shopName for public endpoint)
   * @returns {Promise<Object>} GCash payment response
   */
  async createGCashPayment(paymentData) {
    try {
      // Use public endpoint if shopName is provided, otherwise use authenticated endpoint
      const endpoint = paymentData.shopName ? '/public/gcash' : '/gcash';
      const response = await this.apiClient.post(endpoint, paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating GCash payment:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Failed to create GCash payment';
      
      // Handle connection errors specifically
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to payment server. Please check if the backend server is running.';
      }
      
      return {
        success: false,
        error: errorMessage,
        data: error.response?.data,
      };
    }
  }

  /**
   * Create credit/debit card payment
   * @param {Object} paymentData - Payment details (should include shopName for public endpoint)
   * @returns {Promise<Object>} Card payment response
   */
  async createCardPayment(paymentData) {
    try {
      // Use public endpoint if shopName is provided, otherwise use authenticated endpoint
      const endpoint = paymentData.shopName ? '/public/card' : '/card';
      const response = await this.apiClient.post(endpoint, paymentData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating card payment:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Failed to create card payment';
      
      // Handle connection errors specifically
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to payment server. Please check if the backend server is running.';
      }
      
      return {
        success: false,
        error: errorMessage,
        data: error.response?.data,
      };
    }
  }

  /**
   * Create card token for secure storage
   * @param {Object} cardData - Card details (should include shopName for public endpoint)
   * @returns {Promise<Object>} Token response
   */
  async createCardToken(cardData) {
    try {
      // Use public endpoint if shopName is provided, otherwise use authenticated endpoint
      const endpoint = cardData.shopName ? '/public/card-token' : '/card-token';
      const response = await this.apiClient.post(endpoint, cardData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Error creating card token:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Failed to create card token';
      
      // Handle connection errors specifically
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to payment server. Please check if the backend server is running.';
      }
      
      return {
        success: false,
        error: errorMessage,
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
   * @param {string} shopName - Shop name for public endpoint
   * @returns {Object} Formatted payment data
   */
  formatPaymentData(orderData, customerData, method, shopName = null) {
    const data = {
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
    
    // Add shopName for public endpoints
    if (shopName) {
      data.shopName = shopName;
    }
    
    return data;
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
