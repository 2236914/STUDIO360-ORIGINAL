const { supabase } = require('./supabaseClient');

async function listSystemAnnouncements() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('system_announcements')
    .select('*')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data || [];
}

async function listAllSystemAnnouncements() {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('system_announcements')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data || [];
}

async function getSystemAnnouncement(id) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('system_announcements')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
}

async function createSystemAnnouncement({ title, message, type, isActive, expiresAt, createdBy }) {
  if (!supabase) return null;
  
  const announcement = {
    title,
    message,
    type: type || 'info',
    is_active: isActive !== undefined ? isActive : true,
    expires_at: expiresAt || null,
    created_by: createdBy,
  };
  
  const { data, error } = await supabase
    .from('system_announcements')
    .insert([announcement])
    .select('*')
    .single();
  
  if (error) return null;
  return data;
}

async function updateSystemAnnouncement(id, { title, message, type, isActive, expiresAt }) {
  if (!supabase) return null;
  
  const update = {
    updated_at: new Date().toISOString(),
  };
  
  if (title !== undefined) update.title = title;
  if (message !== undefined) update.message = message;
  if (type !== undefined) update.type = type;
  if (isActive !== undefined) update.is_active = isActive;
  if (expiresAt !== undefined) update.expires_at = expiresAt;
  
  const { data, error } = await supabase
    .from('system_announcements')
    .update(update)
    .eq('id', id)
    .select('*')
    .single();
  
  if (error) return null;
  return data;
}

async function deleteSystemAnnouncement(id) {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('system_announcements')
    .delete()
    .eq('id', id);
  
  return !error;
}

module.exports = {
  listSystemAnnouncements,
  listAllSystemAnnouncements,
  getSystemAnnouncement,
  createSystemAnnouncement,
  updateSystemAnnouncement,
  deleteSystemAnnouncement,
};

