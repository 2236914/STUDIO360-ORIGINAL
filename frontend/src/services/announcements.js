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
    async function detectServerUrl() {
      try {
        const cached = isBrowser ? sessionStorage.getItem('serverUrl:detected') : null;
        if (cached) return cached;
      } catch (_) {}
      const candidates = [
        CONFIG.site.serverUrl,
        isBrowser ? `${window.location.origin.replace(/:\d+$/, ':3001')}` : null,
        isBrowser ? `${window.location.origin.replace(/:\d+$/, ':3021')}` : null,
        'http://localhost:3001',
        'http://localhost:3021',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3021',
      ].filter(Boolean);
      for (const base of candidates) {
        try {
          const ac = new AbortController();
          const t = setTimeout(() => ac.abort(), 2000);
          const r = await fetch(`${base}/api/status`, { signal: ac.signal });
          clearTimeout(t);
          if (r.ok) {
            try { if (isBrowser) sessionStorage.setItem('serverUrl:detected', base); } catch (_) {}
            return base;
          }
        } catch (_) {}
      }
      return CONFIG.site.serverUrl;
    }

    const base = await detectServerUrl();
    const primary = `${base}/api/announcements/system`;
    const fallback = '/api/announcements/system';

    async function fetchOnce(url) {
      const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, json };
    }

    let { ok, json } = await fetchOnce(primary);
    if (!ok) ({ ok, json } = await fetchOnce(fallback));
    if (!ok) return [];
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

