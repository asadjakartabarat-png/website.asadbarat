import { NextRequest, NextResponse } from 'next/server';
import { getPasanggiriScores, createPasanggiriScore } from '@/lib/turso/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const competition_id = request.nextUrl.searchParams.get('competition_id');
    const juri_name = request.nextUrl.searchParams.get('juri_name') || undefined;
    const filters: any = {};
    if (competition_id) filters.competition_id = Number(competition_id);
    if (juri_name) filters.juri_name = juri_name;
    const scores = await getPasanggiriScores(filters);
    return NextResponse.json(scores.map((s: any) => ({
      ...s,
      id: String(Number(s.id)),
      competition_id: String(Number(s.competition_id)),
    })));
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data nilai' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { competition_id, juri_name, criteria_scores, total_score } = await request.json();
    if (!competition_id || !juri_name || !criteria_scores || total_score === undefined) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check duplicate
    const existing = await getPasanggiriScores({ competition_id: Number(competition_id), juri_name });
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Nilai sudah diinput untuk juri ini' }, { status: 400 });
    }

    const score: any = await createPasanggiriScore({
      competition_id: Number(competition_id),
      juri_name,
      criteria_scores,
      total_score: Number(total_score),
    });
    return NextResponse.json({
      ...score,
      id: String(Number(score.id)),
      competition_id: String(Number(score.competition_id)),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
