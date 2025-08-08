import { createClient } from '@supabase/supabase-js';

// Log environment variables for debugging
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://styiinzwhhdmvogyokgk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWlpbnp3aGhkbXZvZ3lva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODEwMzIsImV4cCI6MjA2OTk1NzAzMn0.2AnJRjmOG0dBS0Mo94KqhRjyMdpQCmFoPMlMKjAAaFY';

// Configure Supabase client with additional options
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        console.log('Getting item from storage:', key);
        const item = localStorage.getItem(key);
        console.log('Retrieved item:', item);
        return item;
      },
      setItem: (key, value) => {
        console.log('Setting item in storage:', { key, value });
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        console.log('Removing item from storage:', key);
        localStorage.removeItem(key);
      },
    },
  },
});

// Log Supabase client configuration
console.log('Supabase client configured with URL:', SUPABASE_URL);