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
    console.error('Bookkeeping Service: Authenticated request error:', error);
    throw error;
  }
}

// ============================================
// BOOKKEEPING API
// ============================================

export const bookkeepingApi = {
  // Get quarterly sales totals for tax calculation
  async getQuarterlySales(quarter = 1, year = 2025) {
    try {
      const params = new URLSearchParams();
      params.append('quarter', quarter.toString());
      params.append('year', year.toString());
      
      const url = `${CONFIG.site.serverUrl}/api/bookkeeping/quarterly-sales?${params.toString()}`;
      const response = await authenticatedRequest(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch quarterly sales');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching quarterly sales:', error);
      throw new Error(error.message || 'Failed to fetch quarterly sales');
    }
  },

  // Get all cash receipts
  async getCashReceipts() {
    try {
      const url = `${CONFIG.site.serverUrl}/api/bookkeeping/cash-receipts`;
      const response = await authenticatedRequest(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cash receipts');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching cash receipts:', error);
      throw new Error(error.message || 'Failed to fetch cash receipts');
    }
  },

  // Get ledger summary
  async getLedgerSummary() {
    try {
      const url = `${CONFIG.site.serverUrl}/api/bookkeeping/ledger/summary`;
      const response = await authenticatedRequest(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch ledger summary');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching ledger summary:', error);
      throw new Error(error.message || 'Failed to fetch ledger summary');
    }
  }
};
