import axios from 'axios';

import { CONFIG } from 'src/config-global';

const API_URL = CONFIG.site.serverUrl;

/**
 * Public storefront API - No authentication required
 */
export const storefrontApi = {
  /**
   * Test backend connectivity
   */
  async testConnection() {
    try {
      console.log(`Testing connection to: ${API_URL}/api/status`);
      const response = await axios.get(`${API_URL}/api/status`, {
        timeout: 5000,
      });
      console.log('Backend connection test successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetch about page data for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getAboutPage(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/about`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching about page:', error);
      throw error;
    }
  },

  /**
   * Fetch shipping page data for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getShippingPage(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/shipping`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching shipping page:', error);
      throw error;
    }
  },

  /**
   * Fetch FAQ items for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getFAQs(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/faqs`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  },

  /**
   * Fetch shop info for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getShopInfo(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/info`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching shop info:', error);
      throw error;
    }
  },

  /**
   * Fetch featured products for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getFeaturedProducts(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/featured-products`, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  /**
   * Fetch products for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getProducts(shopName) {
    try {
      console.log(`Fetching products from: ${API_URL}/api/public/storefront/${shopName}/products`);
      console.log(`API_URL is: ${API_URL}`);
      
      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/products`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('Products response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      throw error;
    }
  },

  /**
   * Fetch categories for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getCategories(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/categories`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Fetch events for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getEvents(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/events`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Fetch partner platforms for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getPartners(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/partners`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  /**
   * Fetch homepage data for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getHomepage(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/homepage`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  },

  /**
   * Fetch coupon block directly (public)
   */
  async getCoupon(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/coupon`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon data:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Subscribe an email to the store's newsletter (public)
   */
  async subscribeNewsletter(shopName, { email, name }) {
    try {
      const response = await axios.post(`${API_URL}/api/assistant/subscribe/${shopName}`, {
        email,
        name,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      return { success: false, error: error?.response?.data?.message || error.message };
    }
  },

  /**
   * Fetch split feature for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getSplitFeature(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/split-feature`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching split feature:', error);
      throw error;
    }
  },

  /**
   * Fetch coupon settings for a store
   * @param {string} shopName - The shop name/slug (e.g., 'kitschstudio')
   */
  async getCoupon(shopName) {
    try {
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/coupon`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon:', error);
      throw error;
    }
  },
};

