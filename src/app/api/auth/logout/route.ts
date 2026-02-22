import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const url = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return response;
}
