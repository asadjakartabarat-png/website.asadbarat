import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkPondokAssignmentComplete, lockPondokAssignment } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { peserta_id, penguji_id } = await request.json();
  if (!peserta_id || !penguji_id)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    const isComplete = await checkPondokAssignmentComplete(peserta_id, penguji_id);
    if (isComplete) {
      await lockPondokAssignment(peserta_id);
      return NextResponse.json({ locked: true, message: 'Assignment locked' });
    }
    return NextResponse.json({ locked: false, message: 'Not complete yet' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check assignment' }, { status: 500 });
  }
}
