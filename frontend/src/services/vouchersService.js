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
// VOUCHERS API
// ============================================

export const vouchersApi = {
  // Vouchers
  async getVouchers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters.type && filters.type.length > 0) params.append('type', filters.type.join(','));
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `${CONFIG.site.serverUrl}/api/vouchers${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔍 Fetching vouchers from:', url);
    const response = await authenticatedRequest(url);
    const data = await response.json();
    console.log('📦 Response:', { success: data.success, count: data.data?.length || 0 });
    
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getVoucherById(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getVoucherByCode(code) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/code/${code}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createVoucher(voucherData) {
    console.log('➕ Creating voucher:', voucherData);
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers`, {
      method: 'POST',
      body: JSON.stringify(voucherData),
    });
    const data = await response.json();
    console.log('✅ Voucher creation response:', data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateVoucher(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async toggleVoucherStatus(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}/toggle`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteVoucher(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteVouchers(ids) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Validation & Usage
  async validateVoucher(code, customerId = null, cartTotal = 0) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/validate`, {
      method: 'POST',
      body: JSON.stringify({
        code,
        customer_id: customerId,
        cart_total: cartTotal,
      }),
    });
    const data = await response.json();
    return data;
  },

  async applyVoucher(id, usageData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(usageData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getVoucherUsage(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/${id}/usage`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Statistics
  async getVoucherStats() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/vouchers/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

