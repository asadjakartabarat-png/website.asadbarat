// ============================================================
// KONFIGURASI TEMPLATE SURAT (Letter Generator)
// Tambah jenis surat baru = tambahkan 1 objek di array LETTER_TEMPLATES.
// kind menentukan layout: 'undangan' | 'mandat' | 'formal'
// ============================================================

export type LetterKind = 'undangan' | 'mandat' | 'formal';

export interface Kop {
  baris1: string; // PENGURUS PADEPOKAN / PENGURUS KOTA
  baris2: string; // PERGURUAN PENCAK SILAT NASIONAL
  baris3: string; // ASAD
  baris4: string; // CENGKARENG / JAKARTA BARAT
  alamat: string;
  kontak: string;
}

export interface DataRow { label: string; value: string; }
export interface PesertaRow { nama: string; kelompok: string; desa: string; }

export interface LetterTemplate {
  id: string;
  label: string;
  kind: LetterKind;
  signature: 'one' | 'two';
  kop: Kop;
  fields: Record<string, string>;
  peserta?: PesertaRow[];
  penerima?: string[];
  dataList?: DataRow[];
  showKelompok?: boolean;
}

const KOP_PADEPOKAN: Kop = {
  baris1: 'PENGURUS PADEPOKAN',
  baris2: 'PERGURUAN PENCAK SILAT NASIONAL',
  baris3: 'ASAD',
  baris4: 'CENGKARENG',
  alamat: 'Jl. Fajar Baru III No. 13 RT. 003/ RW. 08 Cengkareng Timur',
  kontak: 'Telp. 021 541 4520  ·  E-mail : asad.jakartabarat@gmail.com',
};

const KOP_KOTA: Kop = {
  baris1: 'PENGURUS KOTA',
  baris2: 'PERGURUAN PENCAK SILAT NASIONAL',
  baris3: 'ASAD',
  baris4: 'JAKARTA BARAT',
  alamat: 'Jl. Fajar Baru III No. 13 RT. 003/ RW. 08 Cengkareng Timur',
  kontak: 'Telp. 021 541 4520  ·  E-mail : asad.jakartabarat@gmail.com',
};

const PENUTUP_UNDANGAN = 'Demikian surat undangan ini kami sampaikan, mengingat pentingnya acara tersebut kami mohon para peserta bisa hadir tepat waktu. Atas perhatiannya kami ucapkan terima kasih. Alhamdulillah Jazakumullohukhoiro.';

export const LETTER_TEMPLATES: LetterTemplate[] = [
  // ---------------- UNDANGAN ----------------
  {
    id: 'undangan_penderesan_astrida',
    label: 'Undangan Penderesan Astrida',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: true,
    fields: {
      nomor: '', lampiran: '', hal: 'Undangan',
      kota_tanggal: 'Jakarta, 5 Juni 2026',
      kepada: 'Bpk Pembina Persinas Asad Desa Se-Padepokan Cengkareng',
      pembuka: 'Dengan segala kerendahan hati, kami mohon kepada Bapak Pembina Asad Desa untuk dapat menghadirkan Alumni Asad Putri Daerah pada:',
      hari_tanggal: 'Minggu, 7 Juni 2026', waktu: 'Pukul 09:00 s/d 11:30 WIB', tempat: 'GSG Putri',
      acara: 'Penderesan Asad Putri Daerah Padepokan Cengkareng', nb: '',
      penutup: PENUTUP_UNDANGAN,
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA', nama_kiri: 'H. Suharyono',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'AHMAD LANGGENG',
      judul_lampiran: 'DAFTAR PESERTA PENDERESAN ASAD PUTRI DAERAH PADEPOKAN CENGKARENG',
      catatan_lampiran: 'NB: SM atau SB yang namanya tidak tercantum supaya tetap bisa hadir',
    },
    peserta: [{ nama: '', kelompok: '', desa: '' }],
  },
  {
    id: 'undangan_penderesan_tsb_putri',
    label: 'Undangan Penderesan TSB Putri',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: false,
    fields: {
      nomor: '', lampiran: '', hal: 'Undangan',
      kota_tanggal: 'Jakarta, 22 September 2023',
      kepada: 'Bpk Pembina Persinas Asad Desa Se-Padepokan Cengkareng',
      pembuka: 'Dengan segala kerendahan hati, kami mohon kepada Bapak Pembina Asad Desa untuk dapat menghadirkan Alumni TSB Putri Tahun 2023 pada:',
      hari_tanggal: 'Hari Minggu mulai bulan September s/d bulan November 2023', waktu: 'Pukul 15.30 s/d 17.30 WIB', tempat: 'Lantai 2 Gedung Putri',
      acara: 'Penderesan TSB Putri Se Daerah', nb: '',
      penutup: PENUTUP_UNDANGAN,
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA', nama_kiri: 'H. Suharyono',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'AHMAD LANGGENG',
      judul_lampiran: 'DAFTAR PESERTA PENDERESAN TSB PUTRI 2023',
      catatan_lampiran: 'NB: SM atau SB yang namanya tidak tercantum supaya tetap bisa hadir',
    },
    peserta: [{ nama: '', kelompok: '', desa: '' }],
  },
  {
    id: 'undangan_tatap_muka_beladiri_putri',
    label: 'Undangan Tatap Muka ASAD Beladiri Putri',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: false,
    fields: {
      nomor: '', lampiran: '', hal: 'Undangan',
      kota_tanggal: 'Jakarta, 10 Juni 2022',
      kepada: 'Bpk Pembina Persinas Asad Desa Se-Padepokan Cengkareng',
      pembuka: 'Sehubungan dengan diterimanya undangan dari Pengurus Persinas Asad DKI No. 022/SUM/I/VI/2022 tentang Tatap Muka/Turba ASAD Beladiri Putri DKI Jakarta, maka kami mohon kepada Bapak Pembina Asad Desa untuk dapat menghadirkan Alumni Asad Putri Daerah pada:',
      hari_tanggal: 'Minggu, 12 Juni 2022', waktu: 'Pukul 08.00 WIB s/d 11.30 WIB', tempat: 'Padepokan Persinas Asad Kebon Jeruk',
      acara: 'Penderesan Tatap Muka/Turba ASAD Beladiri Putri DKI Jakarta', nb: '',
      penutup: PENUTUP_UNDANGAN,
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA', nama_kiri: 'H. Abdul Ghofur',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'AHMAD LANGGENG',
      judul_lampiran: 'DAFTAR PESERTA TATAP MUKA/TURBA ASAD BELADIRI PUTRI DKI JAKARTA',
      catatan_lampiran: '',
    },
    peserta: [{ nama: '', kelompok: '', desa: '' }],
  },
  {
    id: 'undangan_pembekalan_ppa',
    label: 'Undangan Pembekalan Materi PPA',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: false,
    fields: {
      nomor: '', lampiran: '', hal: 'Undangan',
      kota_tanggal: 'Jakarta, 7 September 2023',
      kepada: 'Bpk Pembina Persinas Asad Kelompok Se-Padepokan Cengkareng',
      pembuka: 'Berdasarkan Program Kerja PPG Bidang Sen-Or PPA Tahun 2023, PengPad Persinas Asad memohon kepada Bapak Pembina Persinas Asad Kelompok untuk menghadirkan Mubaligh Tugasan Kelompok pada:',
      hari_tanggal: 'Sabtu, 9 September 2023', waktu: 'Pukul 19.00 WIB s/d 22.00 WIB (Isya di Daerah)', tempat: 'Lantai 3 Masjid Baitul Muttaqin',
      acara: 'Pembekalan Materi PPA dan Pemberian Materi Pertemuan 1-5', nb: '',
      penutup: PENUTUP_UNDANGAN,
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA', nama_kiri: 'H. Suharyono',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'AHMAD LANGGENG',
      judul_lampiran: 'DAFTAR PESERTA', catatan_lampiran: '',
    },
  },
  {
    id: 'undangan_pembukaan_tsb',
    label: 'Undangan Pembukaan Tashih Sabuk Biru (TSB)',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: false,
    fields: {
      nomor: '', lampiran: '', hal: 'Undangan',
      kota_tanggal: 'Jakarta, 2 Agustus 2023',
      kepada: 'Bpk Pembina Desa Se-Cengkareng Jakarta Barat',
      pembuka: 'Sehubungan akan berlangsungnya Tashih Sabuk Biru Tahun 2023, kami selaku pengurus Persinas Asad Padepokan Cengkareng meminta amal shalih para bapak pembina desa agar bisa menghadiri Pembukaan Tashih Sabuk Biru Tahun 2023, pada:',
      hari_tanggal: 'Minggu, 6 Agustus 2023', waktu: 'Pukul 10.00 s/d Selesai', tempat: 'Masjid Baitul Muttaqien Lt 3',
      acara: '', nb: 'Memakai seragam asad lengkap',
      penutup: 'Demikian surat undangan ini kami sampaikan, atas perhatian dan kerjasamanya kami syukuri, Alhamdulillah Jazakumullohukhoiro.',
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA DAERAH', nama_kiri: 'H. SUHARYONO',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'AHMAD LANGGENG',
      judul_lampiran: 'DAFTAR PESERTA', catatan_lampiran: '',
    },
  },
  {
    id: 'undangan_atlet_indonesia_open',
    label: 'Undangan/Pemberitahuan Atlet Desa (Indonesia Open)',
    kind: 'undangan', signature: 'two', kop: KOP_PADEPOKAN, showKelompok: false,
    fields: {
      nomor: '002/SPK/VIII/2022', lampiran: '-', hal: 'Pemberitahuan Kegiatan',
      kota_tanggal: 'Jakarta, 11 Agustus 2022',
      kepada: 'Bpk Pembina Asad Desa se-Jakarta Barat Cengkareng',
      pembuka: 'Sehubungan dengan datangnya surat dari Pengurus Besar Persinas Asad Nomor : 088/SUM/PB.ASAD/VIII/2022 perihal Pengerahan Masa dalam acara Pembukaan Kejuaraan Internasional Pencak Silat Indonesia Open Championship tahun 2022, maka dengan ini kami meminta para Pembina Desa untuk bisa mengirimkan Pendekar atau Atlet. Para peserta dimohon berkumpul untuk diberi pengarahan dan keberangkatan pada:',
      hari_tanggal: "Jum'at (malam Sabtu), 12 September 2022", waktu: 'Pukul 19.00 WIB (sholat isya di daerah)', tempat: 'Masjid Baitul Muttaqin Cengkareng Jakarta Barat',
      acara: 'Pengerahan Atlet Indonesia Open Championship 2022', nb: 'Membawa: seragam Asad lengkap + sabuk, sepatu olahraga, peralatan mandi secukupnya.',
      penutup: 'Demikian surat pemberitahuan kegiatan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapkan terima kasih dan disyukuri, Alhamdulillah Jazakumullohukhoiro.',
      organisasi: 'PENGPAD PERSINAS ASAD CENGKARENG',
      jabatan_kiri: 'PEMBINA', nama_kiri: 'H. Abdul Ghofur',
      jabatan_kanan: 'KORDINATOR', nama_kanan: 'Ahmad Langgeng',
      judul_lampiran: 'DAFTAR PESERTA', catatan_lampiran: '',
    },
  },

  // ---------------- MANDAT ----------------
  {
    id: 'mandat_tot',
    label: 'Surat Mandat (TOT Tanding & TGR)',
    kind: 'mandat', signature: 'one', kop: KOP_KOTA,
    fields: {
      nomor: '041 / SM / II / 2019',
      pertimbangan: 'Bahwa perlu segera mengeluarkan surat mandat untuk merealisasi maksud dasar tersebut dibawah.',
      dasar: '1. Surat Pengurus Provinsi DKI Jakarta PERSINAS ASAD kepada Pembina Padepokan Kebon Jeruk & Cengkareng\n2. Pertimbangan Pengurus Kota PERSINAS ASAD DKI Jakarta Barat',
      untuk: '1. Seterimanya surat mandat ini agar masing-masing mengikuti acara Training Of Trainer Tanding & Seni TGR Persinas Asad DKI Jakarta yang akan dilaksanakan pada:\n   Hari : 16 - 17 Februari 2019\n   Tempat : Pondok Gede Jakarta Timur\n2. Melaksanakan Mandat ini dengan penuh rasa tanggung jawab.',
      dikeluarkan_di: 'Jakarta', pada_tanggal: '14 Februari 2019',
      jabatan_ttd: 'Ketua Pengkot PERSINAS ASAD Jakarta Barat', nama_ttd: 'H. Solikhin',
      tembusan: 'Dewan Pembina Persinas ASAD Kota Jakarta Barat',
    },
    penerima: ['Fadel Muhamad Bayhaqi', 'Firman Ahyari', 'Ibnu Muhammad Manshurin', 'Sakti Dwi Prasetyo Hadi', 'Adnan Dwi Gifari'],
  },
  {
    id: 'mandat_ukt',
    label: 'Surat Mandat (Ujian Kenaikan Tingkat)',
    kind: 'mandat', signature: 'one', kop: KOP_KOTA,
    fields: {
      nomor: '038 / SM / XXIII / X / 2016',
      pertimbangan: 'Bahwa perlu segera mengeluarkan surat mandat untuk merealisasi maksud dasar tersebut dibawah.',
      dasar: '1. Surat Pengurus Provinsi DKI Jakarta PERSINAS ASAD Nomor : 057/SUM/I/XI/2016 Tertanggal 7 November 2016, Perihal : Ujian Kenaikan Tingkat\n2. Pertimbangan Pengurus Kota PERSINAS ASAD DKI Jakarta Barat',
      untuk: '1. Seterimanya surat mandat ini agar masing-masing mengikuti acara Ujian Kenaikan Tingkat Persinas Asad DKI Jakarta yang akan dilaksanakan pada:\n   Hari : 26-27 November 2016\n   Tempat : Pondok Gede Jakarta Timur\n2. Melaksanakan Mandat ini dengan penuh rasa tanggung jawab.',
      dikeluarkan_di: 'Jakarta', pada_tanggal: '23 November 2016',
      jabatan_ttd: 'Ketua Pengkot PERSINAS ASAD Jakarta Barat', nama_ttd: 'H. Solikhin',
      tembusan: 'Dewan Pembina Persinas ASAD Kota Jakarta Barat',
    },
    penerima: ['Setyo Dermawan Mafaza', 'Andre Kurniawan', 'Firman Ahyari', 'Dimas Apriansyah'],
  },
  {
    id: 'mandat_wasit_juri',
    label: 'Surat Mandat (Wasit Juri Pasanggiri)',
    kind: 'mandat', signature: 'one', kop: KOP_KOTA,
    fields: {
      nomor: '034 / SUM / I / VII / 2015',
      pertimbangan: 'Bahwa perlu segera mengeluarkan surat mandat untuk merealisasi maksud dasar tersebut dibawah.',
      dasar: '1. Surat Pengurus PERSINAS ASAD Provinsi DKI Jakarta Nomor : 055/SUM/I/VIII/2015 Tertanggal 3 Agustus 2015, perihal : Penataran Wasit Juri Pasanggiri tingkat Nasional Persinas Asad.\n2. Pertimbangan Pengurus Kota PERSINAS ASAD DKI Jakarta Barat',
      untuk: '1. Seterimanya surat mandat ini agar masing-masing mengikuti acara Penataran Wasit Juri Pasanggiri tingkat Nasional Persinas Asad yang akan dilaksanakan pada:\n   Hari : Jum\u2019at-Minggu, 21-23 Agustus 2015\n   Waktu : Pukul 16.00 WIB - Selesai\n   Tempat : Padepokan PERSINAS ASAD, Yayasan Ponpes Minhajurrosyiddin, Jl. SPG VII No. 17 Lubang Buaya, Jakarta Timur 13810\n2. Melaksanakan Mandat ini dengan penuh rasa tanggung jawab.',
      dikeluarkan_di: 'Jakarta', pada_tanggal: '12 Agustus 2015',
      jabatan_ttd: 'Ketua Pengkot PERSINAS ASAD Jakarta Barat', nama_ttd: 'H. Solikhin',
      tembusan: 'Dewan Pembina Persinas ASAD Kota Jakarta Barat',
    },
    penerima: ['Wari Priadi', 'Abdul Aziz'],
  },

  // ---------------- FORMAL (Dispensasi / Pemberitahuan / Permohonan) ----------------
  {
    id: 'formal_dispensasi',
    label: 'Surat Dispensasi (Sekolah)',
    kind: 'formal', signature: 'one', kop: KOP_KOTA,
    fields: {
      nomor: '', lampiran: '-', hal: 'Dispensasi',
      kota_tanggal: 'Jakarta, 14 Februari 2019',
      kepada: 'Yth Bapak/Ibu Bag Kesiswaan\nSMA Negeri 94 Jakarta\nDi tempat',
      paragraf1: 'Alhamdulillah segala puji dan syukur bagi Allah SWT yang telah memberikan nikmat kepada kita semua.\n\nDengan datangnya surat ini, kami selaku Pengurus Persinas Asad Kota Jakarta Barat memberitahukan bahwa anak didik kami:',
      paragraf2: 'Akan mengikuti acara Training Of Trainer Tanding & Seni Tunggal, Ganda, Regu Pencak Silat IPSI yang akan diselenggarakan:',
      hari: 'Sabtu - Minggu', tanggal: '16 - 17 Februari 2019', tempat_formal: 'Ponpes Minhajurrosyiddin Pondok Gede Jakarta Timur, Padepokan Persinas Asad DKI Jakarta',
      paragraf_penutup: 'Maka dari itu, kami mohon kepada Bapak/Ibu Bag Kesiswaan dapat memberikan izin kepada anak didik kami agar dapat mengikuti kegiatan tersebut. Atas partisipasinya kami ucapkan terima kasih.',
      jabatan_ttd: 'Ketua Pengkot PERSINAS ASAD Jakarta Barat', nama_ttd: 'H. Solikhin',
    },
    dataList: [{ label: 'Nama', value: 'M. Mustofa Inalakhyar' }, { label: 'Kelas', value: 'XI MIPA 2' }, { label: 'Jabatan', value: 'Atlet' }],
  },
  {
    id: 'formal_pemberitahuan_izin',
    label: 'Surat Pemberitahuan / Izin Kegiatan',
    kind: 'formal', signature: 'one', kop: KOP_PADEPOKAN,
    fields: {
      nomor: '', lampiran: '-', hal: 'Pemberitahuan',
      kota_tanggal: 'Jakarta, 19 September 2023',
      kepada: 'Yth Pengurus/Pengelola\nPusdiklat Senkom Sawangan Depok\nDi tempat',
      paragraf1: 'Alhamdulillah segala puji dan syukur bagi Allah SWT yang telah memberikan nikmat kepada kita semua.\n\nDengan datangnya surat ini, kami selaku Pengurus Persinas Asad Padepokan Cengkareng Kota Jakarta Barat memberitahukan bahwa kami akan mengadakan “Keakraban Astrida” pada:',
      paragraf2: '',
      hari: 'Sabtu - Minggu', tanggal: '30 September 2023 s/d 1 Oktober 2023', tempat_formal: 'Pusdiklat Senkom Sawangan Depok',
      paragraf_penutup: 'Maka dari itu, kami mohon kepada Pengurus/Pengelola Pusdiklat Senkom Sawangan Depok dapat memberikan izin kepada kami agar dapat mengadakan acara tersebut. Atas partisipasinya kami ucapkan Alhamdulillahi jaza kumullahu khoiro.',
      jabatan_ttd: 'Ketua Pengpad Cengkareng', nama_ttd: 'Ahmad Langgeng',
    },
    dataList: [],
  },
  {
    id: 'formal_permohonan_rekomendasi',
    label: 'Surat Permohonan Rekomendasi',
    kind: 'formal', signature: 'one', kop: KOP_KOTA,
    fields: {
      nomor: '01/PENGKOT/IV/2017', lampiran: '-', hal: 'Permohonan Rekomendasi & FC 8355 Legalisir',
      kota_tanggal: 'Jakarta, 25 April 2017',
      kepada: 'Kepada Yth\nBapak/Ibu Kepala Sekolah\n.........................\nDi tempat',
      paragraf1: 'Sehubungan dengan kegiatan Kejuaraan Beladiri Pencak Silat Tingkat SMP & SMA IPSI Jakarta Barat yang bertempat di Gelanggang Remaja Jakarta Barat Jl. Muwardi Raya pada tanggal 5-7 Mei 2017, maka dengan ini kami selaku Pengurus Kota Persinas Asad Jakarta Barat mengajukan permohonan surat rekomendasi dari Kepala Sekolah dan FC 8355 Legalisir untuk anak didik kami yaitu:',
      paragraf2: '',
      hari: '', tanggal: '', tempat_formal: '',
      paragraf_penutup: 'Demikian surat permohonan ini kami sampaikan. Atas perhatian serta kerjasama dari Bapak/Ibu kami ucapkan terima kasih.',
      jabatan_ttd: 'Ketua Pengkot PERSINAS ASAD Jakarta Barat', nama_ttd: 'H. Solikhin',
    },
    dataList: [{ label: 'Nama', value: '' }, { label: 'Kelas', value: '' }, { label: 'Jabatan', value: 'Atlet' }],
  },
];
