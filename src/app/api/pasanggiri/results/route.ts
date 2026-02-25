import { NextRequest, NextResponse } from 'next/server';
import { getAllPasanggiriCompetitions, getPasanggiriScores } from '@/lib/turso/db';
import { calculateFinalScore } from '@/lib/pasanggiri/scoring';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const kelas = request.nextUrl.searchParams.get('kelas') || undefined;
    const golongan = request.nextUrl.searchParams.get('golongan') || undefined;
    const kategori = request.nextUrl.searchParams.get('kategori') || undefined;

    const competitions = await getAllPasanggiriCompetitions({ status: 'COMPLETED', kelas });
    const scores = await getPasanggiriScores();

    const desaResults: any = {};

    competitions.forEach((comp: any) => {
      if (golongan && comp.golongan !== golongan) return;
      if (kategori && comp.kategori !== kategori) return;

      const key = `${comp.nama_desa}-${comp.kelas}-${comp.golongan}`;
      if (!desaResults[key]) {
        desaResults[key] = {
          desa: comp.nama_desa,
          kelas: comp.kelas,
          golongan: comp.golongan,
          categories: {},
          total_score: 0,
        };
      }

      const competitionScores = scores.filter((s: any) => String(Number(s.competition_id)) === String(Number(comp.id)));
      const totalScore = calculateFinalScore(competitionScores);

      desaResults[key].categories[comp.kategori] = totalScore;
      desaResults[key].total_score += totalScore;
    });

    const results = Object.values(desaResults).sort((a: any, b: any) => b.total_score - a.total_score);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil hasil' }, { status: 500 });
  }
}
