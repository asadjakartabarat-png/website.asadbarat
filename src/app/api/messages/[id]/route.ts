import { NextRequest, NextResponse } from 'next/server';
import { markMessageRead, deleteMessage } from '@/lib/turso/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  await markMessageRead(params.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await deleteMessage(params.id);
  return NextResponse.json({ success: true });
}
