'use client';

import { useEffect, useRef, useState } from 'react';

export interface PublicNotulensi {
  judul: string;
  tanggal: string;
  catatan: string | null;
}

// Jeda polling. 5 detik terasa realtime untuk notulensi, dan tetap hemat
// kuota karena polling otomatis berhenti saat tab tidak dilihat.
const POLL_MS = 5000;

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Diformat manual (bukan toLocaleDateString) supaya hasil di server dan di
// browser selalu identik — menghindari hydration mismatch.
function formatTanggal(t: string) {
  if (!t) return '-';
  const d = new Date(t.length <= 10 ? t + 'T00:00:00' : t);
  if (isNaN(d.getTime())) return t;
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function jam(d: Date) {
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

export default function NotulensiPublicClient({ token, initial }: { token: string; initial: PublicNotulensi }) {
  const [data, setData] = useState<PublicNotulensi>(initial);
  const [gone, setGone] = useState(false);
  const [offline, setOffline] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const goneRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      // Berhenti total bila sudah dinonaktifkan, dan lewati saat tab
      // di-background agar tidak membuang kuota function Vercel.
      if (cancelled || goneRef.current || document.hidden) return;
      try {
        const res = await fetch(`/api/public/musyawarah/${token}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 404) { goneRef.current = true; setGone(true); return; }
        if (!res.ok) { setOffline(true); return; }
        const j = await res.json();
        if (cancelled || !j.data) return;
        setData(j.data);
        setOffline(false);
        setLastSync(new Date());
      } catch {
        if (!cancelled) setOffline(true);
      }
    };

    const timer = setInterval(poll, POLL_MS);
    // Begitu pembaca kembali ke tab ini, langsung ambil versi terbaru
    // tanpa menunggu siklus berikutnya.
    const onVisible = () => { if (!document.hidden) poll(); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);

  if (gone) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm max-w-sm w-full p-8 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h1 className="text-lg font-bold text-gray-900">Notulensi tidak tersedia</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Halaman publik untuk notulensi ini sedang dinonaktifkan oleh pengurus.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 bg-green-800 text-white shadow-sm">
        <div className="mx-auto max-w-2xl px-5 py-4">
          <div className="flex items-center gap-2 text-xs font-medium text-green-200">
            {offline ? (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Koneksi terputus — mencoba lagi
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-300" />
                </span>
                Diperbarui otomatis
              </>
            )}
          </div>
          <h1 className="mt-1.5 text-lg sm:text-xl font-bold leading-snug">{data.judul}</h1>
          <p className="mt-0.5 text-sm text-green-200">{formatTanggal(data.tanggal)}</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">
        <article className="bg-white rounded-2xl shadow-sm p-5 sm:p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Isi / Catatan Musyawarah</h2>
          {data.catatan?.trim() ? (
            <p className="whitespace-pre-wrap text-[15px] sm:text-base leading-7 text-gray-800">{data.catatan}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Catatan musyawarah belum diisi.</p>
          )}
        </article>

        <p className="mt-4 text-center text-xs text-gray-400">
          {lastSync ? `Terakhir dicek ${jam(lastSync)}` : 'Halaman ini memperbarui isinya sendiri'}
        </p>
      </main>
    </div>
  );
}
