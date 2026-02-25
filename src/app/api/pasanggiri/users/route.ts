import { NextRequest, NextResponse } from 'next/server';
import { getAllPasanggiriUsers, createPasanggiriUser, updatePasanggiriUser, deletePasanggiriUser } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAllPasanggiriUsers();
    return NextResponse.json(users.map(u => ({
      id: String(Number(u.id)),
      username: u.username,
      role: u.role,
      is_active: Boolean(Number(u.is_active)),
      created_at: u.created_at,
      updated_at: u.updated_at,
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();
    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }
    const user = await createPasanggiriUser({ username, password, role });
    return NextResponse.json({
      id: String(Number(user.id)),
      username: user.username,
      role: user.role,
      is_active: Boolean(Number(user.is_active)),
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat user' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    if (data.is_active !== undefined) data.is_active = data.is_active ? 1 : 0;
    const user = await updatePasanggiriUser(Number(id), data);
    return NextResponse.json({
      id: String(Number(user.id)),
      username: user.username,
      role: user.role,
      is_active: Boolean(Number(user.is_active)),
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengupdate user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });
    await deletePasanggiriUser(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 });
  }
}
