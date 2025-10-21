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
// INVOICES API
// ============================================

export const invoicesApi = {
  // Invoices
  async getInvoices(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.service && filters.service.length > 0) params.append('service', filters.service.join(','));
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `${CONFIG.site.serverUrl}/api/invoices${queryString ? `?${queryString}` : ''}`;
    
    const response = await authenticatedRequest(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getInvoiceById(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getInvoiceByNumber(invoiceNumber) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/number/${invoiceNumber}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createInvoice(invoiceData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices`, {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateInvoice(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateInvoiceStatus(id, status) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async markInvoiceAsSent(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${id}/send`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteInvoice(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteInvoices(ids) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Invoice Items
  async getInvoiceItems(invoiceId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${invoiceId}/items`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Invoice Payments
  async getInvoicePayments(invoiceId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${invoiceId}/payments`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async addInvoicePayment(invoiceId, paymentData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Statistics
  async getInvoiceStats() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/invoices/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

