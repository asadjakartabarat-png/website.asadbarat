import { NextRequest, NextResponse } from 'next/server';
import { createMessage, getAllMessages } from '@/lib/turso/db';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    const id = 'msg_' + Date.now();
    await createMessage({ id, name, email, message });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await getAllMessages();
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
