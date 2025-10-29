const { supabase } = require('./supabaseClient');

async function listRecentMessages(sellerId, limit = 10) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_messages_view')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

async function listTickets(sellerId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('seller_id', sellerId)
    .order('updated_at', { ascending: false });
  if (error) return [];
  return data || [];
}

async function createTicket({ sellerId, subject, category, body }) {
  if (!supabase) return null;
  const now = new Date().toISOString();
  const { data: ticketRows, error: ticketErr } = await supabase
    .from('support_tickets')
    .insert([{ seller_id: sellerId, subject, category, status: 'open', created_at: now, updated_at: now }])
    .select('*')
    .single();
  if (ticketErr) return null;
  const ticket = ticketRows;
  const { data: msgRows } = await supabase
    .from('support_messages')
    .insert([{ ticket_id: ticket.id, author_id: sellerId, body }])
    .select('*')
    .single();
  await supabase
    .from('support_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticket.id);
  return { ...ticket, first_message_id: msgRows?.id };
}

async function addMessage({ ticketId, authorId, body }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('support_messages')
    .insert([{ ticket_id: ticketId, author_id: authorId, body }])
    .select('*')
    .single();
  if (error) return null;
  await supabase
    .from('support_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId);
  return data;
}

async function addAttachment({ ticketId, cloudinaryPublicId, cloudinaryUrl, resourceType, bytes }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('support_attachments')
    .insert([{ ticket_id: ticketId, cloudinary_public_id: cloudinaryPublicId, cloudinary_url: cloudinaryUrl, resource_type: resourceType, bytes }])
    .select('*')
    .single();
  if (error) return null;
  return data;
}

async function listAllTickets() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) return [];
  return data || [];
}

async function getTicketDetails(ticketId) {
  if (!supabase) return null;
  
  // Get ticket
  const { data: ticket, error: ticketErr } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();
  if (ticketErr || !ticket) return null;
  
  // Get messages
  const { data: messages } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  
  // Get attachments
  const { data: attachments } = await supabase
    .from('support_attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
  
  return {
    ...ticket,
    messages: messages || [],
    attachments: attachments || [],
  };
}

async function updateTicketStatus(ticketId, status, priority) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, priority, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select('*')
    .single();
  if (error) return null;
  return data;
}

async function getTicketStats() {
  if (!supabase) return { total: 0, open: 0, inProgress: 0, closed: 0 };
  
  const { data: allTickets } = await supabase
    .from('support_tickets')
    .select('status');
  
  if (!allTickets) return { total: 0, open: 0, inProgress: 0, closed: 0 };
  
  const stats = {
    total: allTickets.length,
    open: allTickets.filter(t => t.status === 'open').length,
    inProgress: allTickets.filter(t => t.status === 'in-progress').length,
    closed: allTickets.filter(t => t.status === 'closed').length,
  };
  
  return stats;
}

module.exports = {
  listRecentMessages,
  listTickets,
  createTicket,
  addMessage,
  addAttachment,
  listAllTickets,
  getTicketDetails,
  updateTicketStatus,
  getTicketStats,
};


