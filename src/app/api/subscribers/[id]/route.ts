import { NextRequest, NextResponse } from 'next/server';
import { deleteSubscriber } from '@/lib/turso/db';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteSubscriber(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
