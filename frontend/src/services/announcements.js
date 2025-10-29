import { CONFIG } from 'src/config-global';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${session?.access_token || ''}`,
  };
  const res = await fetch(`${CONFIG.site.serverUrl}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Request failed');
  return json?.data ?? json;
}

// Public: Get active system announcements
async function listSystemAnnouncements() {
  try {
    const isBrowser = typeof window !== 'undefined';
    const url = isBrowser
      ? '/api/announcements/system' // Use Next.js rewrite in browser to avoid CORS
      : `${CONFIG.site.serverUrl}/api/announcements/system`;

    console.log('[Announcements] Fetching from:', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Avoid caching stale announcements
      cache: 'no-store',
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'Request failed');
    return json?.data ?? json;
  } catch (error) {
    console.error('Error fetching system announcements:', error);
    console.error('[Announcements] Server URL:', CONFIG.site.serverUrl);
    return [];
  }
}

// Admin: Get all announcements
async function listAllAnnouncements() {
  return authFetch('/api/announcements/admin/list', { method: 'GET' });
}

// Admin: Create announcement
async function createSystemAnnouncement(payload) {
  return authFetch('/api/announcements/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Admin: Update announcement
async function updateSystemAnnouncement(id, payload) {
  return authFetch(`/api/announcements/admin/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// Admin: Delete announcement
async function deleteSystemAnnouncement(id) {
  return authFetch(`/api/announcements/admin/${id}`, { method: 'DELETE' });
}

export default {
  listSystemAnnouncements,
  listAllAnnouncements,
  createSystemAnnouncement,
  updateSystemAnnouncement,
  deleteSystemAnnouncement,
};

