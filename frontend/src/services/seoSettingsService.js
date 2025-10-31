import { CONFIG } from 'src/config-global';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

async function authenticatedRequest(url, options = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('No authentication session available');
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  const response = await fetch(url, { ...options, ...defaultOptions });
  return response;
}

export const seoSettingsApi = {
  async get() {
    const res = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/seo`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load SEO settings');
    return data.data;
  },
  async update(payload) {
    const res = await authenticatedRequest(`${CONFIG.site.serverUrl}/api/store-pages/seo`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update SEO settings');
    return data.data;
  },
};


