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
// MAIL API
// ============================================

export const mailApi = {
  // Mail CRUD
  async getMail(filters = {}) {
    const params = new URLSearchParams();
    if (filters.label) params.append('label', filters.label);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.is_read !== undefined) params.append('is_read', filters.is_read);
    if (filters.is_starred !== undefined) params.append('is_starred', filters.is_starred);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `${CONFIG.site.serverUrl}/api/mail${queryString ? `?${queryString}` : ''}`;
    
    const response = await authenticatedRequest(url);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getMailById(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createMail(mailData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail`, {
      method: 'POST',
      body: JSON.stringify(mailData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateMail(id, updateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async deleteMail(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async deleteMails(ids) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  // Mail Actions
  async markAsRead(id, isRead = true) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}/read`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: isRead }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async markMailsAsRead(ids, isRead = true) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/bulk/read`, {
      method: 'PUT',
      body: JSON.stringify({ ids, is_read: isRead }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data;
  },

  async toggleStar(id) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}/star`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateLabels(id, labels) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}/labels`, {
      method: 'PUT',
      body: JSON.stringify({ labels }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async updateStatus(id, status) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Replies
  async getReplies(mailId) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${mailId}/replies`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createReply(mailId, replyData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/${mailId}/replies`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Labels
  async getLabels() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/labels/all`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async getLabelCounts() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/labels/counts`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createLabel(labelData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/labels/create`, {
      method: 'POST',
      body: JSON.stringify(labelData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Templates
  async getTemplates() {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/templates/all`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  async createTemplate(templateData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/templates/create`, {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Send email via SMTP
  async sendEmail(emailData) {
    const response = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/mail/send-email`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },
};

