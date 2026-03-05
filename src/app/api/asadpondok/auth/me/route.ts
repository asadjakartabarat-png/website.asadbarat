import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = cookies().get('asadpondok_session')?.value;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ user: JSON.parse(session) });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
