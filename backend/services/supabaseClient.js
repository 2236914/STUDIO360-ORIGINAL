const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (url && serviceRole) {
  try {
    supabase = createClient(url, serviceRole, { auth: { persistSession: false } });
    console.log('✅ Supabase client initialized successfully');
  } catch (e) {
    console.error('❌ Failed to initialize Supabase client:', e);
    supabase = null;
  }
} else {
  console.error('⚠️ Supabase credentials missing. URL:', !!url, 'Service Key:', !!serviceRole);
}

module.exports = { supabase };
