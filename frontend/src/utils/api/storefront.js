import client from 'src/utils/api/client';

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
      console.log(`Testing connection to: /api/status (base: ${API_URL})`);
      const response = await client.get(`/status`, { timeout: 5000 });
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
      const response = await client.get(`/public/storefront/${shopName}/about`);
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
      const response = await client.get(`/public/storefront/${shopName}/shipping`);
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
      const response = await client.get(`/public/storefront/${shopName}/faqs`);
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
      const response = await client.get(`/public/storefront/${shopName}/info`);
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
      const response = await client.get(`/public/storefront/${shopName}/featured-products`);
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
      console.log(`Fetching products from: /api/public/storefront/${shopName}/products`);
      console.log(`API_URL is: ${API_URL}`);
      
      // Add a small delay to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await client.get(`/public/storefront/${shopName}/products`);
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
      const response = await client.get(`/public/storefront/${shopName}/categories`);
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
      const response = await client.get(`/public/storefront/${shopName}/events`);
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
      const response = await client.get(`/public/storefront/${shopName}/partners`);
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
      const response = await client.get(`/public/storefront/${shopName}/homepage`);
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
      const response = await client.get(`/public/storefront/${shopName}/coupon`);
      return { success: true, data: response.data };
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
      const response = await client.post(`/assistant/subscribe/${shopName}`, {
        email,
        name,
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
      const response = await client.get(`/public/storefront/${shopName}/split-feature`);
      return response.data;
    } catch (error) {
      console.error('Error fetching split feature:', error);
      throw error;
    }
  },

  /**
   * Fetch welcome popup for a store (public)
   */
  async getWelcomePopup(shopName) {
    try {
      const response = await client.get(`/public/storefront/${shopName}/welcome-popup`);
      return response.data;
    } catch (error) {
      console.error('Error fetching welcome popup:', error);
      throw error;
    }
  },

  /**
   * Validate voucher code publicly for a storefront
   */
  async validateVoucher(shopName, code, cartTotal = 0) {
    try {
      const response = await client.get(`/public/storefront/${shopName}/voucher/validate`, {
        params: { code, cart_total: cartTotal },
      });
      return response.data;
    } catch (error) {
      console.error('Error validating voucher:', error);
      return { success: false, data: { is_valid: false } };
    }
  },

  // (duplicate getCoupon removed; consolidated above)
};

