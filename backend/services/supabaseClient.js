const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (url && serviceRole) {
  try {
    supabase = createClient(url, serviceRole, { auth: { persistSession: false } });
  } catch (e) {
    supabase = null;
  }
}

module.exports = { supabase };
