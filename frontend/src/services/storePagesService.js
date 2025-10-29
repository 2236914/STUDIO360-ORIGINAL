import { CONFIG } from 'src/config-global';

import { supabase } from 'src/auth/context/jwt/supabaseClient';

// Helper function for authenticated requests using Supabase
async function authenticatedRequest(url, options = {}) {
  try {
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      throw new Error('No authentication session available');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // In the browser, prefer relative '/api' to use Next.js proxy and avoid CORS/port issues
    let finalUrl = url;
    if (typeof window !== 'undefined') {
      try {
        const base = (CONFIG.site.serverUrl || '').replace(/\/$/, '');
        if (base && url.startsWith(base)) {
          finalUrl = url.slice(base.length);
        }
      } catch (_) { /* noop */ }
    }

    const response = await fetch(finalUrl, { ...options, ...defaultOptions });
    
    // If we get a 401/403, the token might be invalid
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  } catch (error) {
    console.error('Authenticated request error:', error);
    throw error;
  }
}

// ============================================
// HOMEPAGE API
// ============================================

export const homepageApi = {
  async getCompleteHomepageData() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateHeroSection(heroData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/hero`, {
      method: 'PUT',
      body: JSON.stringify(heroData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateFeaturedProducts(featuredData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/featured-products`, {
      method: 'PUT',
      body: JSON.stringify(featuredData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getCategories() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/categories`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createCategory(categoryData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateCategory(categoryId, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteCategory(categoryId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/categories/${categoryId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async updateSplitFeature(featureData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/split-feature`, {
      method: 'PUT',
      body: JSON.stringify(featureData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateCoupon(couponData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/coupon`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateEventsBlock(eventsData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/events`, {
      method: 'PUT',
      body: JSON.stringify(eventsData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getPlatforms() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/platforms`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createPlatform(platformData) {
    // Backend validates platform_name and platform_url; send both for compatibility
    const payload = {
      ...platformData,
      platform_name: platformData.name || platformData.platform_name,
      platform_url: platformData.url || platformData.platform_url,
    };
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/platforms`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updatePlatform(platformId, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/platforms/${platformId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deletePlatform(platformId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/platforms/${platformId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async updateAnnouncement(announcementData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/announcement`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateWelcomePopup(popupData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/homepage/welcome-popup`, {
      method: 'PUT',
      body: JSON.stringify(popupData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

// ============================================
// ABOUT PAGE API
// ============================================

export const aboutPageApi = {
  async getCompleteAboutData() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateShopStory(storyData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/shop-story`, {
      method: 'PUT',
      body: JSON.stringify(storyData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateSocialMedia(socialData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/social-media`, {
      method: 'PUT',
      body: JSON.stringify(socialData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getSocialPlatforms() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/social-platforms`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createSocialPlatform(platformData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/social-platforms`, {
      method: 'POST',
      body: JSON.stringify(platformData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateSocialPlatform(platformId, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/social-platforms/${platformId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteSocialPlatform(platformId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/about/social-platforms/${platformId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ============================================
// SHIPPING PAGE API
// ============================================

export const shippingPageApi = {
  async getCompleteShippingData() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateLocalShipping(shippingData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/local`, {
      method: 'PUT',
      body: JSON.stringify(shippingData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateInternationalShipping(shippingData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/international`, {
      method: 'PUT',
      body: JSON.stringify(shippingData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateShippingRates(ratesData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/rates`, {
      method: 'PUT',
      body: JSON.stringify(ratesData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateReturnPolicy(policyData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/return-policy`, {
      method: 'PUT',
      body: JSON.stringify(policyData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getFAQs() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/faqs`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createFAQ(faqData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/faqs`, {
      method: 'POST',
      body: JSON.stringify(faqData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateFAQ(faqId, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/faqs/${faqId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteFAQ(faqId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/shipping/faqs/${faqId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ============================================
// CUSTOMER SUPPORT API
// ============================================

export const customerSupportApi = {
  async getCompleteCustomerSupportData() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateWhatsAppSettings(whatsappData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/whatsapp`, {
      method: 'PUT',
      body: JSON.stringify(whatsappData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateGmailSettings(gmailData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/gmail`, {
      method: 'PUT',
      body: JSON.stringify(gmailData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateFAQChatbotSettings(chatbotData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/faq-chatbot`, {
      method: 'PUT',
      body: JSON.stringify(chatbotData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getFAQChatbotItems() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/faq-chatbot/items`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createFAQChatbotItem(itemData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/faq-chatbot/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateFAQChatbotItem(itemId, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/faq-chatbot/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteFAQChatbotItem(itemId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/customer-support/faq-chatbot/items/${itemId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

// ============================================
// EVENTS API
// ============================================

export const eventsApi = {
  async getEvents() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/events`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createEvent(eventData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/events`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateEvent(eventId, eventData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteEvent(eventId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/events/${eventId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },
};

