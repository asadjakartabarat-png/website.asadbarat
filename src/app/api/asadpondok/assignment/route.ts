import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getAllPondokAssignments,
  createPondokAssignment,
  updatePondokAssignment,
  deletePondokAssignment,
} from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

function getSession() {
  const s = cookies().get('asadpondok_session')?.value;
  return s ? JSON.parse(s) : null;
}

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const assignments = await getAllPondokAssignments();
  return NextResponse.json({ assignments });
}

export async function POST(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { peserta_id, penguji_id } = await request.json();
  if (!peserta_id || !penguji_id)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    const assignment = await createPondokAssignment({ peserta_id, penguji_id });
    return NextResponse.json({ assignment });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Peserta sudah di-assign' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { peserta_id, penguji_id } = await request.json();
  if (!peserta_id || !penguji_id)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

  try {
    const assignment = await updatePondokAssignment(peserta_id, penguji_id);
    if (!assignment)
      return NextResponse.json({ error: 'Assignment locked atau tidak ditemukan' }, { status: 400 });
    return NextResponse.json({ assignment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['superadmin', 'korda'].includes(session.role))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { peserta_id } = await request.json();
  if (!peserta_id)
    return NextResponse.json({ error: 'Missing peserta_id' }, { status: 400 });

  try {
    await deletePondokAssignment(peserta_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
