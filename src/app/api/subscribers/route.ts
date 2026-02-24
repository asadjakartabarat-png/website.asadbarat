import { NextRequest, NextResponse } from 'next/server';
import { createSubscriber, getAllSubscribers } from '@/lib/turso/db';

export async function GET() {
  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json(subscribers);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 });
    }
    const id = 'sub_' + Date.now() + Math.random().toString(36).slice(2, 7);
    await createSubscriber({ id, email: email.trim().toLowerCase() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
