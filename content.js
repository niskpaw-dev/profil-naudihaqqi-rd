/* =========================================================
   PROFIL DIGITAL — KONFIGURASI + KANDUNGAN ASAL
   ---------------------------------------------------------
   1. PROFILE_API : tampal URL Web App GAS (berakhir /exec).
      Biar kosong = laman guna kandungan asal di bawah sahaja.
   2. DEFAULT_CONTENT : kandungan sandaran. Laman guna ini bila
      backend belum disambung / gagal dicapai. Selepas Tuan
      Naudi simpan di /admin, data dari Google Sheets diguna.

   Medan berbahasa: { ms, en, ar }. Jika en/ar kosong, BM diguna.
========================================================= */
window.PROFILE_API = 'https://script.google.com/macros/s/AKfycbyuKWrrEO0P7iL-B8FKdVVb5L8fIbcb7mEyNTQP2Qp-s7GoFtuSZffbaDvLI1HJOD2j/exec';

window.DEFAULT_CONTENT = {
  version: 1,
  updatedAt: null,

  profile: {
    name:  { ms: 'MOHD NAUDI HAQQI', en: 'MOHD NAUDI HAQQI', ar: 'محمد نودي حقي' },
    title: { ms: 'Pengetua SMK Jugra', en: 'Principal, SMK Jugra', ar: 'مدير مدرسة جوغرا الثانوية' },
    photo: 'https://arleta.site/interactivelink/1610/Untitled-design_20260420_065706_0000.png',
    phone: '+60136930292',
    phoneDisplay: '013-6930292',
    whatsapp: '60136930292',
    email: 'haqqimad@gmail.com',
    email2: 'g-81351799@moe-dl.edu.my',
    org: 'SMK Jugra',
    address: {
      ms: 'SMK Jugra,\nJalan Sultan Abdul Samad,\n42700 Banting, Selangor',
      en: 'SMK Jugra,\nJalan Sultan Abdul Samad,\n42700 Banting, Selangor',
      ar: 'مدرسة جوغرا الثانوية،\nجالان سلطان عبد الصمد،\n42700 بانتينج، سلانغور'
    },
    mapUrl: 'https://maps.google.com/?cid=2105583668730597592',
    quoteAr: 'خير الناس أنفعهم للناس',
    quote: {
      ms: 'Sebaik-baik manusia adalah yang paling bermanfaat kepada manusia lain.',
      en: 'The best of people are those most beneficial to others.',
      ar: 'خير الناس أنفعهم للناس.'
    },
    quoteSource: 'HR. Ahmad, Thabrani'
  },

  stats: [
    { value: 23, label: { ms: 'Tahun', en: 'Years', ar: 'سنة' } },
    { value: 5,  label: { ms: 'Sekolah', en: 'Schools', ar: 'مدرسة' } },
    { value: 2,  label: { ms: 'Anugerah', en: 'Awards', ar: 'جائزة' } }
  ],

  /* Jawatan berturutan di organisasi sama (bukan "semasa") dikumpul dalam satu kad. */
  career: [
    { title: { ms: 'Pengetua' }, org: { ms: 'SMK Jugra' }, period: '05 Jan 2026 — Kini', current: true },
    { title: { ms: 'Pemangku Pengetua' }, org: { ms: 'SMK Bandar Saujana Putra' }, period: '2025 — 2026' },
    { title: { ms: 'Guru Penolong Kanan Pentadbiran' }, org: { ms: 'SMK Bandar Saujana Putra' }, period: '2024 — 2025' },
    { title: { ms: 'Pemangku PK Pentadbiran' }, org: { ms: 'SMK Bandar Saujana Putra' }, period: '2023 — 2024' },
    { title: { ms: 'Guru Penolong Kanan HEM' }, org: { ms: 'SMK Bandar Saujana Putra' }, period: '2022 — 2024' },
    { title: { ms: 'Caretaker Pembukaan Sekolah Baharu' }, org: { ms: 'SMK Bandar Saujana Putra' }, period: '2022' },
    { title: { ms: 'Guru Kanan Mata Pelajaran Sains & Matematik' }, org: { ms: 'SMK Jenjarom' }, period: '2019 — 2022' },
    { title: { ms: 'Guru Akademik Biasa' }, org: { ms: 'SMK Banting' }, period: '2003 — 2019' }
  ],

  education: [
    { title: { ms: 'Diploma Pengurusan & Pentadbiran Pendidikan' }, institution: { ms: 'NPQEL — Institut Aminuddin Baki' }, year: '2025' },
    { title: { ms: 'Diploma Tasawwur Islam' }, institution: { ms: 'Institut Latihan Kepimpinan & Perkaderan Dakwah Islamiyah (ILHAM)' }, year: '2013' },
    { title: { ms: 'Ijazah Sarjana Muda Sains dgn Pendidikan (Kepujian) — Biologi' }, institution: { ms: 'Universiti Putra Malaysia' }, year: '2003' },
    { title: { ms: 'Alumni Madrasah Islamiah Jenderam Hilir' }, institution: { ms: 'Yayasan Al-Jenderami' }, year: '2000—2003' }
  ],

  innovation: {
    show: true,
    label: { ms: 'Gagasan Inovasi', en: 'Flagship Innovation' },
    titlePrefix: { ms: 'Budaya', en: 'The' },
    titleHighlight: 'SAPUTRA',
    titleSuffix: { ms: '', en: 'Culture' },
    est: '2022',
    description: { ms: 'Kerangka budaya sekolah berteraskan pembinaan sahsiah, adab dan nilai murni. Terbukti meningkatkan disiplin, persekitaran pembelajaran serta pencapaian pelajar — menjadi model berimpak tinggi dalam 3 tahun operasi.' },
    values: [
      { letter: 'S', label: { ms: 'Sahsiah' } },
      { letter: 'A', label: { ms: 'Adab' } },
      { letter: 'P', label: { ms: 'Patuh' } },
      { letter: 'U', label: { ms: 'Usaha' } },
      { letter: 'T', label: { ms: 'Taat' } },
      { letter: 'R', label: { ms: 'Rajin' } },
      { letter: 'A', label: { ms: 'Amanah' } }
    ]
  },

  achievements: [
    { title: { ms: 'Anugerah Gangsa Pembentangan Amalan Terbaik Pengetua Selangor' }, date: '05 JUN 2024', icon: 'star' },
    { title: { ms: 'Pembentang Amalan Terbaik UiTM Puncak Alam' }, date: '21 FEBRUARI 2024', icon: 'video' }
  ],

  gallery: [
    { img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', caption: { ms: 'Majlis Sekolah' } },
    { img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800', caption: { ms: 'Budaya SAPUTRA' } },
    { img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800', caption: { ms: 'Pengajaran' } },
    { img: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800', caption: { ms: 'Perhimpunan' } }
  ],

  testimonials: [
    { quote: { ms: 'Kepimpinan beliau dalam memperkenalkan Budaya SAPUTRA telah membawa transformasi disiplin yang sangat signifikan.' }, name: { ms: 'Rakan Pengetua' }, from: { ms: 'Selangor' } },
    { quote: { ms: 'Pemimpin yang tidak jemu memberi tunjuk ajar — gabungan pendidikan akademik dan nilai keagamaan yang unggul.' }, name: { ms: 'Guru Kanan' }, from: { ms: 'SMK Bandar Saujana Putra' } },
    { quote: { ms: 'Kuliah-kuliah beliau di masjid amat bermanfaat. Ilmu disampaikan dengan cukup jelas, padat dan penuh hikmah.' }, name: { ms: 'Jemaah Masjid' }, from: { ms: 'Kg. Sungai Lang Baru' } }
  ],

  community: [
    { title: { ms: 'Imam Masjid Kampung Sungai Lang Baru' }, period: '2005 — KINI', icon: 'building' },
    { title: { ms: 'Penolong Pendaftar Nikah Cerai Rujuk (NCR)' }, period: '2008 — KINI', icon: 'clipboard' },
    { title: { ms: 'Pengerusi Biro Dakwah, Pendidikan & Pengimarahan' }, period: '2005 — KINI', icon: 'users' },
    { title: { ms: 'Guru Takmir JAKIM & Pendakwah MAIS' }, period: '2016 — KINI', icon: 'book' },
    { title: { ms: 'Setiausaha Persatuan Ulama Malaysia (Selangor)' }, period: '2018 — KINI', icon: 'badge' }
  ]
};
