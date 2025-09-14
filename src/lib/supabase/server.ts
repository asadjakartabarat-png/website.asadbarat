import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Hardcoded config for production
const SUPABASE_URL = 'https://eizrsybushirzoxdpilc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTkyOTUsImV4cCI6MjA3MzM5NTI5NX0.tF4AmoyAZza0g2OgPdfPJ9_1Zd1vh8QqNfYE16ZH6Kg';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};