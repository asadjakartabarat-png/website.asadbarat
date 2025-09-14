import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Hardcoded config for production
  const SUPABASE_URL = 'https://eizrsybushirzoxdpilc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenJzeWJ1c2hpcnpveGRwaWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MTkyOTUsImV4cCI6MjA3MzM5NTI5NX0.tF4AmoyAZza0g2OgPdfPJ9_1Zd1vh8QqNfYE16ZH6Kg';

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (req.nextUrl.pathname === '/admin/login') {
      // Redirect to dashboard if already logged in
      if (session) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return res;
    }

    // Redirect to login if not authenticated
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // Check if user exists in users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !user) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
  runtime: 'nodejs',
};