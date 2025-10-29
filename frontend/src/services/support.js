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

async function listRecentMessages() {
  return authFetch('/api/support/messages/recent', { method: 'GET' });
}

async function listTickets() {
  return authFetch('/api/support/tickets', { method: 'GET' });
}

async function createTicket(payload) {
  return authFetch('/api/support/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function replyToTicket(ticketId, payload) {
  return authFetch(`/api/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function uploadAttachment(ticketId, file) {
  const { data: { session } } = await supabase.auth.getSession();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${CONFIG.site.serverUrl}/api/support/tickets/${ticketId}/attachments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || 'Upload failed');
  return json?.data ?? json;
}

async function uploadAttachmentUrl(ticketId, url) {
  return authFetch(`/api/support/tickets/${ticketId}/attachments/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
}

// Admin functions
async function listAllTickets() {
  return authFetch('/api/support/admin/tickets', { method: 'GET' });
}

async function getTicketDetails(ticketId) {
  return authFetch(`/api/support/admin/tickets/${ticketId}`, { method: 'GET' });
}

async function updateTicketStatus(ticketId, status, priority) {
  return authFetch(`/api/support/admin/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, priority }),
  });
}

async function getTicketStats() {
  return authFetch('/api/support/admin/stats', { method: 'GET' });
}

async function replyToTicketAsAdmin(ticketId, payload) {
  return authFetch(`/api/support/admin/tickets/${ticketId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export default {
  listRecentMessages,
  listTickets,
  createTicket,
  replyToTicket,
  uploadAttachment,
  uploadAttachmentUrl,
  listAllTickets,
  getTicketDetails,
  updateTicketStatus,
  getTicketStats,
  replyToTicketAsAdmin,
};


