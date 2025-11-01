import axios from 'axios';

import { CONFIG } from 'src/config-global';

import { supabase } from 'src/auth/context/jwt/supabaseClient';

// Helper function for authenticated requests using Supabase (same pattern as account-shop.jsx)
async function authenticatedRequest(url, options = {}) {
  try {
    // Get the current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('Account History: Supabase session check:', { 
      hasSession: !!session, 
      hasError: !!error, 
      tokenPreview: session?.access_token ? `${session.access_token.substring(0, 20)  }...` : 'no token',
      fullToken: session?.access_token || 'no token'
    });
    
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
        const base = (CONFIG.site.serverUrl || '').replace(/\/+$/, '');
        if (base && url.startsWith(base)) {
          finalUrl = url.slice(base.length);
        }
      } catch (_) { /* noop */ }
    }

    console.log('Account History: Making request to:', finalUrl);
    const response = await fetch(finalUrl, { ...options, ...defaultOptions });
    
    // If we get a 401/403, the token might be invalid
    if (response.status === 401 || response.status === 403) {
      throw new Error('Authentication failed. Please log in again.');
    }

    return response;
  } catch (error) {
    console.error('Account History: Authenticated request error:', error);
    throw error;
  }
}

// Create axios instance with default config (keeping for compatibility)
// Use relative URL in browser (Next.js proxy), absolute in SSR
const accountBaseUrl = typeof window !== 'undefined'
  ? '/api/account'
  : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account`;
const apiClient = axios.create({
  baseURL: accountBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('No Supabase session found for account history request');
        return config;
      }
      
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    } catch (error) {
      console.error('Error getting Supabase session:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Authentication failed in account history service');
      // Don't automatically redirect - let the component handle it
    }
    return Promise.reject(error);
  }
);

class AccountHistoryService {
  /**
   * Get user's login history with pagination and filtering
   */
  async getLoginHistory(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        activityType = 'login',
        status,
        startDate,
        endDate,
        search
      } = options;

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      params.append('activityType', activityType);
      
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);

      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? `/api/account/history?${params.toString()}`
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history?${params.toString()}`;
      const response = await authenticatedRequest(historyUrl);
      const data = await response.json();
      
      console.log('Account History Service: API response:', data);
      console.log('Account History Service: Response data structure:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasPagination: !!data.pagination,
        pagination: data.pagination
      });
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch login history');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw new Error(error.message || 'Failed to fetch login history');
    }
  }

  /**
   * Log a new account activity
   */
  async logActivity(activityData) {
    try {
      console.log('Account History Service: Attempting to log activity:', activityData);
      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? '/api/account/history'
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history`;
      console.log('Account History Service: Making request to:', historyUrl);
      
      const response = await authenticatedRequest(historyUrl, {
        method: 'POST',
        body: JSON.stringify(activityData)
      });
      
      console.log('Account History Service: Response status:', response.status);
      const data = await response.json();
      console.log('Account History Service: Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log activity');
      }
      
      return data;
    } catch (error) {
      console.error('Account History Service: Error logging activity:', error);
      console.error('Account History Service: Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw new Error(error.message || 'Failed to log activity');
    }
  }

  /**
   * Clear user's login history
   */
  async clearHistory(activityType = 'login') {
    try {
      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? '/api/account/history'
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history`;
      const response = await authenticatedRequest(historyUrl, {
        method: 'DELETE',
        body: JSON.stringify({ activityType })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear history');
      }
      
      return data;
    } catch (error) {
      console.error('Error clearing history:', error);
      throw new Error(error.message || 'Failed to clear history');
    }
  }

  /**
   * Delete a specific history entry
   */
  async deleteHistoryEntry(entryId) {
    try {
      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? `/api/account/history/${entryId}`
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history/${entryId}`;
      const response = await authenticatedRequest(historyUrl, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete history entry');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting history entry:', error);
      throw new Error(error.message || 'Failed to delete history entry');
    }
  }

  /**
   * Get user's history statistics
   */
  async getHistoryStats() {
    try {
      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? '/api/account/history/stats'
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history/stats`;
      const response = await authenticatedRequest(historyUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch history statistics');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching history stats:', error);
      throw new Error(error.message || 'Failed to fetch history statistics');
    }
  }

  /**
   * Export user's history as CSV
   */
  async exportHistory(options = {}) {
    try {
      const {
        activityType = 'login',
        format = 'csv',
        startDate,
        endDate,
        status
      } = options;

      const params = new URLSearchParams();
      params.append('activityType', activityType);
      params.append('format', format);
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);

      // Use relative URL in browser (Next.js proxy), absolute in SSR
      const historyUrl = typeof window !== 'undefined'
        ? `/api/account/history/export?${params.toString()}`
        : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/account/history/export?${params.toString()}`;
      const response = await authenticatedRequest(historyUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export history');
      }

      // Create download link
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `login-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'History exported successfully' };
    } catch (error) {
      console.error('Error exporting history:', error);
      throw new Error(error.message || 'Failed to export history');
    }
  }

  /**
   * Log a successful login attempt
   */
  async logLogin() {
    try {
      const response = await apiClient.post('/history/log-login');
      return response.data;
    } catch (error) {
      console.error('Error logging login:', error);
      throw new Error(error.response?.data?.message || 'Failed to log login');
    }
  }

  /**
   * Helper method to format history data for display
   */
  formatHistoryData(historyData) {
    return historyData.map(entry => ({
      id: entry.id,
      date: entry.created_at,
      device: entry.device_type || 'Unknown Device',
      browser: entry.browser_name || 'Unknown Browser',
      os: entry.operating_system || 'Unknown OS',
      location: entry.location || 'Unknown Location',
      ipAddress: entry.ip_address || 'Unknown IP',
      status: entry.status || 'unknown',
      activityType: entry.activity_type || 'login',
      isMobile: entry.is_mobile || false,
      isTablet: entry.is_tablet || false,
      isDesktop: entry.is_desktop || true,
      sessionId: entry.session_id
    }));
  }

  /**
   * Helper method to get device icon
   */
  getDeviceIcon(device) {
    if (device.includes('Windows')) return 'logos:microsoft-windows';
    if (device.includes('iPhone') || device.includes('iOS')) return 'logos:apple';
    if (device.includes('Android')) return 'logos:android-icon';
    if (device.includes('Mac')) return 'logos:apple';
    return 'solar:device-2-bold';
  }

  /**
   * Helper method to get status color
   */
  getStatusColor(status) {
    switch (status) {
      case 'successful':
        return 'success';
      case 'failed':
        return 'error';
      case 'suspicious':
        return 'warning';
      default:
        return 'default';
    }
  }

  /**
   * Helper method to search and filter history
   */
  searchHistory(history, query) {
    if (!query) return history;
    
    const searchTerm = query.toLowerCase();
    return history.filter(entry =>
      entry.device?.toLowerCase().includes(searchTerm) ||
      entry.location?.toLowerCase().includes(searchTerm) ||
      entry.ipAddress?.toLowerCase().includes(searchTerm) ||
      entry.browser?.toLowerCase().includes(searchTerm) ||
      entry.os?.toLowerCase().includes(searchTerm) ||
      entry.status?.toLowerCase().includes(searchTerm)
    );
  }
}

// Create and export singleton instance
const accountHistoryService = new AccountHistoryService();
export default accountHistoryService;
