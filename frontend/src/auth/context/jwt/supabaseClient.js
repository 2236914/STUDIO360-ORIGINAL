import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://styiinzwhhdmvogyokgk.supabase.co'; //project url
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0eWlpbnp3aGhkbXZvZ3lva2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzODEwMzIsImV4cCI6MjA2OTk1NzAzMn0.2AnJRjmOG0dBS0Mo94KqhRjyMdpQCmFoPMlMKjAAaFY'; // RAPI KEY or Anon public

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);