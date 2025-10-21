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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/about`);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/shipping`);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/faqs`);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shop info:', error);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/categories`);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/events`);
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
      const response = await axios.get(`${API_URL}/api/public/storefront/${shopName}/partners`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },
};

