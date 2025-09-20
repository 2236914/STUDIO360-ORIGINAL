import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://styiinzwhhdmvogyokgk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWlpbnp3aGhkbXZvZ3lva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODEwMzIsImV4cCI6MjA2OTk1NzAzMn0.2AnJRjmOG0dBS0Mo94KqhRjyMdpQCmFoPMlMKjAAaFY';

// Configure Supabase client with SSR-safe storage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    // Do not persist sessions across reloads: forces fresh sign-in after restart
    persistSession: false,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return sessionStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(key);
        }
      },
    },
  },
});
