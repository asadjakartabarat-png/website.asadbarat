import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Hardcoded config for production
const SUPABASE_URL = 'https://eizrsybushirzoxdpilc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTkyOTUsImV4cCI6MjA3MzM5NTI5NX0.tF4AmoyAZza0g2OgPdfPJ9_1Zd1vh8QqNfYE16ZH6Kg';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgxOTI5NSwiZXhwIjoyMDczMzk1Mjk1fQ._tVsz63XLsRm8FDMLzux9EomySIL6F30Cg3MuyzYQK4';

export const supabase = createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);