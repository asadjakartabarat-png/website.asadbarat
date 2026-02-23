import { NextRequest, NextResponse } from 'next/server';

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME!;
const KEY = process.env.CLOUDINARY_API_KEY!;
const SECRET = process.env.CLOUDINARY_API_SECRET!;
const auth = 'Basic ' + Buffer.from(`${KEY}:${SECRET}`).toString('base64');

export async function GET() {
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image?prefix=asadjakbar&max_results=50`,
    { headers: { Authorization: auth } }
  );
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message }, { status: 400 });
  return NextResponse.json(data.resources);
}

export async function DELETE(request: NextRequest) {
  const { public_id } = await request.json();
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD}/resources/image/${encodeURIComponent(public_id)}`,
    { method: 'DELETE', headers: { Authorization: auth } }
  );
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
