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
// ORDERS API
// ============================================

export const ordersApi = {
  // Orders
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = `${CONFIG.site.serverUrl}/api/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await authenticatedRequest(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getOrderById(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/number/${orderNumber}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createOrder(orderData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateOrder(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateOrderStatus(id, status, notes = null) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateOrdersStatus(ids, status) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/bulk/status`, {
      method: 'PUT',
      body: JSON.stringify({ ids, status }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteOrder(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteOrders(ids) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Order Items
  async getOrderItems(orderId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${orderId}/items`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async addOrderItem(orderId, itemData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Order Notes
  async getOrderNotes(orderId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${orderId}/notes`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async addOrderNote(orderId, noteData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/${orderId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Statistics
  async getOrderStats() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/orders/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

