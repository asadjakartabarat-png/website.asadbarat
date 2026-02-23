import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', 'unsigned_preset');
    cloudFormData.append('folder', 'asadjakbar');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: cloudFormData }
    );

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: 400 });

    return NextResponse.json({ url: data.secure_url });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
