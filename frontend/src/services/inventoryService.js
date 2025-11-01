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

    const response = await fetch(url, { ...options, ...defaultOptions });

    // Handle rate limiting gracefully
    if (response.status === 429) {
      console.warn('Rate limited - request will be retried automatically');
      return {
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ 
          success: false, 
          message: 'Request rate limited. Please try again in a moment.',
          rateLimited: true 
        }),
      };
    }

    // If we get a 401/403, the token might be invalid
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  } catch (error) {
    console.error('Authenticated request error:', error);
    
    // Handle network errors gracefully
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    
    throw error;
  }
}

// ============================================
// INVENTORY API
// ============================================

export const inventoryApi = {
  // Products
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    // support both array and single-string filter values
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        if (filters.status.length > 0) params.append('status', filters.status.join(','));
      } else if (typeof filters.status === 'string' && filters.status.length > 0) {
        params.append('status', filters.status);
      }
    }

    if (filters.stock) {
      if (Array.isArray(filters.stock)) {
        if (filters.stock.length > 0) params.append('stock', filters.stock.join(','));
      } else if (typeof filters.stock === 'string' && filters.stock.length > 0) {
        params.append('stock', filters.stock);
      }
    }

    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `${CONFIG.site.serverUrl}/api/inventory/products${queryString ? `?${queryString}` : ''}`;

    const response = await authenticatedRequest(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getProductById(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createProduct(productData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateProduct(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteProduct(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteProducts(ids) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Variations
  async getProductVariations(productId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${productId}/variations`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createVariation(variationData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/variations`, {
      method: 'POST',
      body: JSON.stringify(variationData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateVariation(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/variations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteVariation(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/variations/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Wholesale Pricing
  async getWholesalePricing(productId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${productId}/wholesale`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createWholesaleTier(tierData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/wholesale`, {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateWholesaleTier(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/wholesale/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteWholesaleTier(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/wholesale/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Categories
  async getCategories() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/categories`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createCategory(categoryData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/categories`, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateCategory(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteCategory(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/categories/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Stock Movements
  async getStockMovements(productId, limit = 50) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/products/${productId}/movements?limit=${limit}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Statistics
  async getInventoryStats() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/inventory/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

