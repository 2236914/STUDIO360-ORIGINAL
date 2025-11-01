import { CONFIG } from 'src/config-global';
import { supabase } from 'src/auth/context/jwt/supabaseClient';

async function authFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    ...(options.headers || {}),
    'Authorization': `Bearer ${session?.access_token || ''}`,
  };
  // Normalize URL to avoid double slashes
  const base = (CONFIG.site.serverUrl || '').replace(/\/+$/, '');
  const cleanPath = (path || '').replace(/^\/+/, '/');
  const url = typeof window !== 'undefined' ? cleanPath : `${base}${cleanPath}`;
  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Request failed');
  return json?.data ?? json;
}

// Public: Get active system announcements
// Simple 60s in-memory cache
let _annCache = { ts: 0, data: [] };

async function listSystemAnnouncements() {
  try {
    const isBrowser = typeof window !== 'undefined';
    // Return cached within 60s
    const now = Date.now();
    if (_annCache.ts && now - _annCache.ts < 60000) {
      return _annCache.data;
    }

    // Use relative URL in browser, absolute in SSR
    const primary = typeof window !== 'undefined' 
      ? '/api/announcements/system'
      : `${(CONFIG.site.serverUrl || '').replace(/\/+$/, '')}/api/announcements/system`;

    async function fetchOnce(url) {
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, json };
    }

    let { ok, json } = await fetchOnce(primary);
    if (!ok) ({ ok, json } = await fetchOnce(fallback));
    if (!ok) return [];
    const data = json?.data ?? json;
    _annCache = { ts: Date.now(), data };
    return data;
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

// Authenticated users (e.g., sellers): Get all announcements
async function listAllAnnouncementsForUsers() {
  return authFetch('/api/announcements/system/all', { method: 'GET' });
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
  listAllAnnouncementsForUsers,
  createSystemAnnouncement,
  updateSystemAnnouncement,
  deleteSystemAnnouncement,
};

