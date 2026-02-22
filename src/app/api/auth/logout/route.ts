import { NextResponse } from 'next/server';

function clearTokenAndRedirect() {
  const response = NextResponse.redirect('https://asadjakbar.vercel.app/admin/login');
  response.cookies.set('admin_token', '', { maxAge: 0, path: '/' });
  return response;
}

export async function POST() {
  return clearTokenAndRedirect();
}

export async function GET() {
  return clearTokenAndRedirect();
}
