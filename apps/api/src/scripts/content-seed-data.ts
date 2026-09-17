// Seed data: all 4 units, 16 lessons, 96 screens extracted from static TS content.
// This is the single source of truth for the initial DB seed.

type SeedChoiceOption = { id: string; label: string };
type SeedAllocationRule =
  | { type: "min"; categoryId: string; min: number }
  | { type: "max"; categoryId: string; max: number };

type SeedScreenBase = {
  type: "concept" | "choice" | "numeric" | "allocation";
  prompt: string;
  explain: string;
};

type SeedChoiceScreen = SeedScreenBase & {
  type: "choice";
  options: SeedChoiceOption[];
  correctId: string;
};

type SeedNumericScreen = SeedScreenBase & {
  type: "numeric";
  numericUnit: string;
  acceptRangeMin: number;
  acceptRangeMax: number;
};

type SeedAllocationScreen = SeedScreenBase & {
  type: "allocation";
  categories: string[];
  rule: SeedAllocationRule;
};

type SeedScreen = SeedScreenBase | SeedChoiceScreen | SeedNumericScreen | SeedAllocationScreen;

type SeedLesson = {
  title: string;
  icon: string;
  screens: SeedScreen[];
};

type SeedUnit = {
  title: string;
  description: string;
  imageUrl: string;
  lessons: SeedLesson[];
};

export const seedUnits: SeedUnit[] = [
  // ── Keuangan ────────────────────────────────────────────────────────────
  {
    title: "Keuangan",
    description: "Menabung, anggaran, cicilan, dan nilai waktu uang.",
    imageUrl: "/unit/keuangan.webp",
    lessons: [
      {
        title: "Kenapa Nabung Lebih Awal Jauh Lebih Untung",
        icon: "PiggyBank",
        screens: [
          {
            type: "choice",
            prompt:
              "Si A nabung 1 juta per bulan selama 10 tahun mulai umur 25, terus berhenti total. Si B nabung 1 juta per bulan selama 15 tahun tapi baru mulai umur 35. Di umur 60, siapa yang duitnya lebih banyak?",
            options: [
              { id: "a", label: "A" },
              { id: "b", label: "B" },
              { id: "c", label: "Sama aja" },
            ],
            correctId: "a",
            explain:
              "A cuma nyetor 120 juta, B nyetor 180 juta. Tapi duit A punya waktu 25 tahun buat berbunga, sementara B cuma 10 tahun.",
          },
          {
            type: "concept",
            prompt:
              "Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.",
            explain:
              "Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Setelah 10 tahun, total tabungan kamu jadi berapa?",
            numericUnit: "juta",
            acceptRangeMin: 80,
            acceptRangeMax: 84,
            explain:
              "Setoran kamu totalnya cuma 60 juta, tapi jadi sekitar 82 juta. Selisih 22 juta itu dari bunga.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Tapi kamu baru mulai 5 tahun lebih telat. Setelah 10 tahun, total tabungan kamu jadi berapa?",
            numericUnit: "juta",
            acceptRangeMin: 33,
            acceptRangeMax: 36,
            explain:
              "Telat 5 tahun bikin hasilnya turun lebih dari setengah. Waktu itu bahan bakar utamanya.",
          },
          {
            type: "allocation",
            prompt:
              "Gaji kamu 5 juta per bulan. Bagi ke tiga pos, dengan syarat tabungan minimal 20%.",
            categories: ["Kebutuhan", "Keinginan", "Tabungan"],
            rule: { type: "min", categoryId: "Tabungan", min: 20 },
            explain:
              "20% dari 5 juta itu 1 juta per bulan. Dalam 10 tahun dengan bunga 6%, itu jadi sekitar 164 juta.",
          },
          {
            type: "choice",
            prompt:
              "Kamu dapat bonus 10 juta. Mana yang paling berpengaruh ke kondisi keuangan kamu 10 tahun lagi?",
            options: [
              { id: "a", label: "Beli HP baru" },
              { id: "b", label: "Masukin ke tabungan jangka panjang" },
              { id: "c", label: "Bayar cicilan kartu kredit yang bunganya 30% per tahun" },
            ],
            correctId: "c",
            explain:
              "Bunga utang 30% jauh lebih besar dari bunga tabungan 6%. Bayar utang mahal itu sama aja dapat untung 30%.",
          },
        ],
      },
      {
        title: "Uang Sekarang vs Masa Depan",
        icon: "TrendingUp",
        screens: [
          {
            type: "choice",
            prompt:
              "Rp 100.000 hari ini bisa beli 20 nasi kotak. 10 tahun lagi, menurut kamu palingan cuma bisa beli berapa?",
            options: [
              { id: "a", label: "Tetap 20" },
              { id: "b", label: "Lebih banyak, 25" },
              { id: "c", label: "Lebih sedikit, 10" },
            ],
            correctId: "c",
            explain:
              "Harga naik terus tiap tahun (inflasi). Uang yang sama, isinya berkurang. Rp 100.000 10 tahun lagi mungkin cuma setara Rp 60.000 hari ini.",
          },
          {
            type: "concept",
            prompt:
              'Inflasi itu kenaikan harga barang dari waktu ke waktu. Rata-rata inflasi Indonesia sekitar 3-5% per tahun. Artinya, uang kamu "mengecil" tiap tahun kalau cuma didiemin.',
            explain:
              "Inflasi adalah musuh tersembunyi. Uang yang tidak bertumbuh lebih lambat dari inflasi berarti nilainya mengecil.",
          },
          {
            type: "numeric",
            prompt:
              "Harga sekarang Rp 50.000. Kalau inflasi 5% per tahun, berapa harga barang yang sama 3 tahun lagi? (dalam ribuan)",
            numericUnit: "ribu",
            acceptRangeMin: 57,
            acceptRangeMax: 59,
            explain: "Rp 50.000 × 1.05 × 1.05 × 1.05 = Rp 57.889. Naik sekitar 8% dalam 3 tahun.",
          },
          {
            type: "choice",
            prompt: "Kamu punya Rp 10 juta. Mana yang nilainya paling terjaga 5 tahun lagi?",
            options: [
              { id: "a", label: "Ditaruh di bawah kasur" },
              { id: "b", label: "Ditaruh di tabungan biasa (bunga 1%)" },
              { id: "c", label: "Ditaruh di reksa dana pasar uang (bunga 5%)" },
            ],
            correctId: "c",
            explain:
              "Tabungan 1% kalah dari inflasi 5%. Reksa dana pasar uang setidaknya mendekati inflasi. Uang di kasur pasti kalah.",
          },
          {
            type: "allocation",
            prompt:
              "Gaji kamu 8 juta per bulan. Alokasikan ke tiga pos ini. Tabungan harus minimal 20%.",
            categories: ["Kebutuhan pokok", "Investasi", "Tabungan darurat"],
            rule: { type: "min", categoryId: "Tabungan darurat", min: 20 },
            explain:
              "Tabungan darurat minimal 3-6 bulan pengeluaran. Setelah terpenuhi, lebih bisa dialihkan ke investasi.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu investasi Rp 2 juta per bulan dengan return 8% per tahun. Setelah 5 tahun, total uang kamu sekitar berapa? (dalam juta)",
            numericUnit: "juta",
            acceptRangeMin: 143,
            acceptRangeMax: 150,
            explain:
              "Setoran total Rp 120 juta, tapi jadi sekitar 146 juta. Bunga berbunga bikin investasi tumbuh lebih cepat dari sekadar nabung.",
          },
        ],
      },
      {
        title: "Membuat Anggaran Sederhana",
        icon: "PieChart",
        screens: [
          {
            type: "choice",
            prompt:
              "Gaji kamu Rp 7 juta per bulan. Setelah bayar sewa, makan, dan transport, sisa Rp 1 juta. Sisa ini sebaiknya?",
            options: [
              { id: "a", label: "Beli barang yang lagi diskon" },
              { id: "b", label: "Tabungan darurat dulu, sisanya baru investing" },
              { id: "c", label: "Terserah, yang penting senang" },
            ],
            correctId: "b",
            explain:
              "Sebelum investasi, tabungan darurat harus terisi dulu. Minimal 3-6 bulan biaya hidup. Kalau ada kejadian mendadak, kamu gak perlu utang.",
          },
          {
            type: "concept",
            prompt:
              "Aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan & investasi. Ini cara sederhana tapi efektif buat atur uang.",
            explain:
              "Anggaran gak harus rumit. Yang penting konsisten. Aturan 50/30/20 jadi framework dasar yang bisa disesuaikan.",
          },
          {
            type: "numeric",
            prompt:
              "Gaji Rp 6 juta per bulan. Berdasarkan aturan 50/30/20, berapa maksimal untuk keinginan? (dalam juta)",
            numericUnit: "juta",
            acceptRangeMin: 1.7,
            acceptRangeMax: 1.9,
            explain:
              "30% dari Rp 6 juta = Rp 1.8 juta. Itu batas untuk keinginan (nongkrong, hiburan, jajan).",
          },
          {
            type: "allocation",
            prompt:
              "Gaji kamu Rp 10 juta. Alokasikan ke empat pos ini. Tabungan & investasi harus minimal 20%.",
            categories: ["Kebutuhan", "Keinginan", "Tabungan", "Investasi"],
            rule: { type: "min", categoryId: "Tabungan", min: 20 },
            explain:
              "Tabungan dan investasi harus jadi prioritas, bukan sisa. Bayar diri sendiri dulu sebelum belanja.",
          },
          {
            type: "choice",
            prompt: "Kamu punya cicilan Rp 1.5 juta per bulan dari gaji Rp 6 juta. Apakah aman?",
            options: [
              { id: "a", label: "Aman, masih 25% dari gaji" },
              { id: "b", label: "Mepet, idealnya di bawah 20%" },
              { id: "c", label: "Bahaya, karena 25% itu terlalu tinggi" },
            ],
            correctId: "c",
            explain:
              "Banyak pakar keuangan menyarankan cicilan maksimal 30% dari gaji. Tapi untuk gaji Rp 6 juta, 25% sudah cukup mepet karena kebutuhan pokok juga besar.",
          },
          {
            type: "numeric",
            prompt:
              "Pengeluaran bulanan kamu Rp 4.5 juta dari gaji Rp 6 juta. Berapa persen uang yang tersimpan? (dalam persen)",
            numericUnit: "persen",
            acceptRangeMin: 24,
            acceptRangeMax: 26,
            explain: "(6 - 4.5) / 6 × 100 = 25%. Itu sudah bagus! Lebih dari 20% yang disarankan.",
          },
        ],
      },
      {
        title: "Memahami Bunga Pinjaman",
        icon: "CreditCard",
        screens: [
          {
            type: "choice",
            prompt:
              "Kamu pinjam Rp 10 juta dengan bunga 2% per bulan. Setelah 1 tahun, berapa total yang harus kamu bayar?",
            options: [
              { id: "a", label: "Rp 10 juta + bunga Rp 2.4 juta = Rp 12.4 juta" },
              { id: "b", label: "Rp 10 juta + bunga Rp 2 juta = Rp 12 juta" },
              { id: "c", label: "Rp 10 juta saja" },
            ],
            correctId: "a",
            explain:
              "Bunga 2% per bulan = 24% per tahun (simple). Rp 10 juta × 24% = Rp 2.4 juta. Total Rp 12.4 juta.",
          },
          {
            type: "concept",
            prompt:
              "Bunga pinjaman itu kebalikan dari bunga tabungan. Kalau bunga tabungan bikin uangmu tumbuh, bunga pinjaman bikin utangmu membesar.",
            explain:
              "Prinsipnya sama: bunga berbunga. Tapi di sisi yang merugikan. Makin lama bayar, makin besar totalnya.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu pinjam Rp 5 juta dengan bunga 10% per tahun. Setelah 2 tahun, berapa total utang kamu? (dalam juta)",
            numericUnit: "juta",
            acceptRangeMin: 6,
            acceptRangeMax: 6.1,
            explain:
              "Rp 5 juta × 1.10 × 1.10 = Rp 6.05 juta. Bunga tahun kedua dihitung dari pokok + bunga tahun pertama.",
          },
          {
            type: "choice",
            prompt:
              "Kamu punya utang Rp 3 juta (bunga 2% per bulan) dan tabungan Rp 3 juta (bunga 1% per bulan). Apakah lebih baik bayar utang dulu atau tetap nabung?",
            options: [
              { id: "a", label: "Bayar utang dulu" },
              { id: "b", label: "Tetap nabung, jaga likuiditas" },
              { id: "c", label: "Sama aja" },
            ],
            correctId: "a",
            explain:
              'Utang bunga 2% > tabungan bunga 1%. Setiap rupiah yang kamu bayar ke utang "menghemat" 2% per bulan. Lebih besar dari untung nabung.',
          },
          {
            type: "allocation",
            prompt:
              "Gaji kamu Rp 8 juta. Kamu punya utang Rp 2 juta per bulan. Alokasikan sisanya. Tabungan darurat harus minimal 15%.",
            categories: ["Kebutuhan", "Bayar utang ekstra", "Tabungan darurat"],
            rule: { type: "min", categoryId: "Tabungan darurat", min: 15 },
            explain:
              "Kalau punya utang bunga tinggi, prioritas bayar utang. Tapi tabungan darurat tetap harus jalan supaya gak tambah utang kalau ada kejadian.",
          },
          {
            type: "choice",
            prompt:
              "Kartu kreditmu bunga 2.5% per bulan. kamu bayar minimum Rp 200 ribu dari total utang Rp 2 juta. Berapa lama lunas kalau gak ditambah?",
            options: [
              { id: "a", label: "10 bulan" },
              { id: "b", label: "Lebih dari 10 bulan" },
              { id: "c", label: "Tidak akan lunas" },
            ],
            correctId: "b",
            explain:
              "Bunga 2.5% × Rp 2 juta = Rp 50.000 per bulan. Bayar minimum Rp 200 ribu, pokok hanya turun Rp 150 ribu. Butuh 13+ bulan, dan bunga terus jalan.",
          },
        ],
      },
    ],
  },

  // ── Akuntansi ───────────────────────────────────────────────────────────
  {
    title: "Akuntansi",
    description: "Persamaan dasar, pencatatan transaksi, laba rugi, dan arus kas.",
    imageUrl: "/unit/akuntansi.webp",
    lessons: [
      {
        title: "Persamaan Dasar: Aset, Utang, dan Modal",
        icon: "Scale",
        screens: [
          {
            type: "choice",
            prompt:
              "Warung kamu punya persediaan 10 juta, kas di laci 5 juta, dan mesin kopi 15 juta. Dalam akuntansi, ketiga hal ini disebut apa?",
            options: [
              { id: "a", label: "Aset" },
              { id: "b", label: "Hutang" },
              { id: "c", label: "Modal" },
              { id: "d", label: "Beban" },
            ],
            correctId: "a",
            explain:
              "Semua barang bernilai yang dimiliki usaha — kas, persediaan, mesin — disebut aset. Aset adalah hal yang bisa mengalirkan manfaat di masa depan.",
          },
          {
            type: "concept",
            prompt:
              "Semua akuntansi berakar di satu persamaan: Aset = Liabilitas + Ekuitas. Aset adalah yang kamu punya. Liabilitas adalah yang kamu pinjam. Ekuitas adalah bagian pemilik.",
            explain:
              "Aset di kiri selalu sama dengan jumlah utang (liabilitas) dan modal pemilik (ekuitas) di kanan. Kalau tidak seimbang, ada yang salah dalam catatan.",
          },
          {
            type: "numeric",
            prompt:
              "Total aset warung kamu 150 juta dan total liabilitas (hutang) 90 juta. Berapa ekuitas atau modal pemiliknya?",
            numericUnit: "juta",
            acceptRangeMin: 58,
            acceptRangeMax: 62,
            explain:
              "Ekuitas = Aset − Liabilitas = 150 − 90 = 60 juta. Inilah bagian yang benar-benar milik pemilik setelah semua hutang dikurangkan.",
          },
          {
            type: "choice",
            prompt:
              "Kamu membeli mesin kopi baru 20 juta secara kredit. Aset bertambah 20 juta. Sisi mana di persamaan yang ikut bertambah?",
            options: [
              { id: "a", label: "Liabilitas, karena ada utang baru" },
              { id: "b", label: "Ekuitas, karena pemilik jadi kaya" },
              { id: "c", label: "Tidak ada, asetnya hilang" },
              { id: "d", label: "Beban, karena uang terpakai" },
            ],
            correctId: "a",
            explain:
              "Beli secara kredit artinya timbul utang. Aset naik 20 juta, liabilitas naik 20 juta — persamaan tetap seimbang dan ekuitas tidak berubah.",
          },
          {
            type: "numeric",
            prompt:
              "Total aset 200 juta dan ekuitas 80 juta. Berapa total liabilitas (hutang) usaha ini?",
            numericUnit: "juta",
            acceptRangeMin: 118,
            acceptRangeMax: 122,
            explain:
              "Liabilitas = Aset − Ekuitas = 200 − 80 = 120 juta. Semakin besar liabilitas dibanding aset, semakin besar risiko usahanya.",
          },
          {
            type: "allocation",
            prompt:
              "Bisnis kopi kamu dibiayai dua sumber: modal sendiri dan hutang. Bagi struktur modal total 100% dengan syarat hutang maksimal 40%.",
            categories: ["Modal sendiri", "Hutang"],
            rule: { type: "max", categoryId: "Hutang", max: 40 },
            explain:
              "Pemberi pinjaman lebih percaya kalau bagian hutang tidak dominan. Hutang maksimal 40% dari total pendanaan menjaga persamaan tetap sehat.",
          },
        ],
      },
      {
        title: "Mencatat Transaksi: Debit dan Kredit",
        icon: "ArrowLeftRight",
        screens: [
          {
            type: "choice",
            prompt:
              "Kamu membeli perlengkapan seharga 5 juta secara tunai. Kas berkurang 5 juta. Akun mana yang bertambah di sisi aset?",
            options: [
              { id: "a", label: "Perlengkapan" },
              { id: "b", label: "Beban sewa" },
              { id: "c", label: "Modal" },
              { id: "d", label: "Hutang" },
            ],
            correctId: "a",
            explain:
              "Perlengkapan adalah aset baru senilai 5 juta. Kas turun 5 juta dan perlengkapan naik 5 juta — total aset tidak berubah, hanya bentuknya yang berubah.",
          },
          {
            type: "concept",
            prompt:
              "Setiap transaksi dicatat dua sisi: debit di kiri dan kredit di kanan. Total debit harus selalu sama dengan total kredit. Inilah sistem pencatatan berpasangan (double-entry).",
            explain:
              "Membeli perlengkapan tunai: debit akun Perlengkapan 5 juta, kredit akun Kas 5 juta. Dua sisi, jumlah sama, dan persamaan aset = liabilitas + ekuitas tetap seimbang.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu menjual kopi 10 juta tunai, dan harga pokok kopi itu 6 juta. Berapa laba kotor dari penjualan ini?",
            numericUnit: "juta",
            acceptRangeMin: 3,
            acceptRangeMax: 5,
            explain:
              "Laba kotor = pendapatan − harga pokok = 10 − 6 = 4 juta. Laba kotor belum dikurangi beban operasional seperti gaji dan listrik.",
          },
          {
            type: "choice",
            prompt: "Pelanggan melunasi hutangnya. Kas bertambah, dan akun yang berkurang adalah …",
            options: [
              { id: "a", label: "Piutang" },
              { id: "b", label: "Pendapatan" },
              { id: "c", label: "Modal" },
              { id: "d", label: "Persediaan" },
            ],
            correctId: "a",
            explain:
              "Penjualan kredit tadi mencatat piutang. Saat dibayar, piutang berkurang dan kas bertambah. Pendapatan sudah diakui saat penjualan terjadi, bukan saat uang masuk.",
          },
          {
            type: "numeric",
            prompt:
              "Sistem double-entry mewajibkan total debit sama dengan total kredit. Jika total debit hari ini 25 juta, berapa total kreditnya?",
            numericUnit: "juta",
            acceptRangeMin: 24,
            acceptRangeMax: 26,
            explain:
              "Total kredit harus persis sama dengan total debit, yaitu 25 juta. Kalau beda, itu tanda ada transaksi yang tercatat salah atau tidak lengkap.",
          },
          {
            type: "numeric",
            prompt:
              "Kas di awal hari 10 juta. Hari ini kamu menerima pembayaran piutang 3 juta dan membayar sewa 2 juta. Berapa kas di akhir hari?",
            numericUnit: "juta",
            acceptRangeMin: 10,
            acceptRangeMax: 12,
            explain:
              "Kas akhir = 10 + 3 − 2 = 11 juta. Mencatat arus kas setiap hari membuat laporan keuangan bisa dipercaya.",
          },
        ],
      },
      {
        title: "Laporan Laba Rugi: Untung atau Rugi",
        icon: "FileText",
        screens: [
          {
            type: "choice",
            prompt: "Pendapatan bulan ini 100 juta dan total beban 70 juta. Berapa laba bersihnya?",
            options: [
              { id: "a", label: "30 juta" },
              { id: "b", label: "170 juta" },
              { id: "c", label: "70 juta" },
              { id: "d", label: "100 juta" },
            ],
            correctId: "a",
            explain:
              "Laba bersih = pendapatan − beban = 100 − 70 = 30 juta. Laporan laba rugi merangkum semua pendapatan dan beban dalam satu periode.",
          },
          {
            type: "concept",
            prompt:
              "Laporan laba rugi menjawab satu pertanyaan: untung atau rugi? Rumusnya Laba Bersih = Pendapatan − Beban. Beban termasuk gaji, sewa, bahan baku, dan listrik.",
            explain:
              "Pendapatan diakui saat penjualan terjadi. Beban dikurangkan saat biaya timbul. Sisanya, kalau positif namanya laba, kalau negatif namanya rugi.",
          },
          {
            type: "numeric",
            prompt: "Pendapatan 80 juta dan total beban 55 juta. Berapa laba bersih usaha kamu?",
            numericUnit: "juta",
            acceptRangeMin: 24,
            acceptRangeMax: 26,
            explain:
              "Laba bersih = 80 − 55 = 25 juta. Melihat angka ini setiap bulan membantu kamu tahu apakah usaha benar-benar menghasilkan.",
          },
          {
            type: "choice",
            prompt:
              "Beban operasional naik 10 juta tapi pendapatan tetap. Apa yang terjadi pada laba bersih?",
            options: [
              { id: "a", label: "Turun 10 juta" },
              { id: "b", label: "Naik 10 juta" },
              { id: "c", label: "Tidak berubah" },
              { id: "d", label: "Naik dua kali lipat" },
            ],
            correctId: "a",
            explain:
              "Karena laba = pendapatan − beban, kenaikan beban 10 juta langsung memangkas laba 10 juta. Mengendalikan beban sama pentingnya dengan menaikkan penjualan.",
          },
          {
            type: "numeric",
            prompt:
              "Pendapatan 200 juta dan laba bersih 50 juta. Berapa margin laba bersih dalam persen?",
            numericUnit: "persen",
            acceptRangeMin: 24,
            acceptRangeMax: 26,
            explain:
              "Margin laba = laba ÷ pendapatan × 100% = 50 ÷ 200 × 100% = 25%. Setiap 100 ribu penjualan menyisakan 25 ribu laba.",
          },
          {
            type: "allocation",
            prompt:
              "Dari setiap 100 rupiah penjualan, bagi ke tiga pos: biaya bahan baku, biaya operasional, dan laba — dengan syarat laba minimal 15%.",
            categories: ["Biaya bahan baku", "Biaya operasional", "Laba"],
            rule: { type: "min", categoryId: "Laba", min: 15 },
            explain:
              "Kalau laba kurang dari 15%, usaha hampir tidak menyisakan hasil untuk pemilik. Bagi yang sehat biasanya menyisakan laba cukup untuk tumbuh dan menjaga kas.",
          },
        ],
      },
      {
        title: "Arus Kas: Uang yang Benar-Benar Masuk dan Keluar",
        icon: "Banknote",
        screens: [
          {
            type: "choice",
            prompt:
              "Usaha kamu untung besar di laporan, tapi uang di rekening terus menipis. Apa penyebab paling umum?",
            options: [
              { id: "a", label: "Penjualan kredit belum dibayar pelanggan" },
              { id: "b", label: "Pendapatan terlalu tinggi" },
              { id: "c", label: "Beban terlalu rendah" },
              { id: "d", label: "Laba ditahan terlalu banyak" },
            ],
            correctId: "a",
            explain:
              "Laba dicatat saat penjualan terjadi, tapi kas baru masuk saat pelanggan membayar. Banyak usaha sehat secara laba tapi bangkrut karena kekurangan kas.",
          },
          {
            type: "concept",
            prompt:
              "Laba dan kas itu beda. Laba adalah hasil kalkulasi; kas adalah uang nyata di rekening. Laporan arus kas mencatat uang yang benar-benar masuk dan keluar.",
            explain:
              "Penjualan kredit menaikkan laba hari ini tapi belum menaikkan kas. Sebaliknya, pembelian mesin tunai menurunkan kas tanpa menurunkan laba sekaligus.",
          },
          {
            type: "numeric",
            prompt:
              "Kas awal bulan 10 juta. Penerimaan kas 25 juta dan pengeluaran kas 18 juta. Berapa kas akhir bulan?",
            numericUnit: "juta",
            acceptRangeMin: 16,
            acceptRangeMax: 18,
            explain:
              "Kas akhir = 10 + 25 − 18 = 17 juta. Menghitung arus kas bulanan mencegah kejutan kehabisan uang di tengah jalan.",
          },
          {
            type: "choice",
            prompt:
              "Kamu membeli mesin espresso baru 30 juta tunai. Dalam laporan arus kas, pembelian ini termasuk kategori apa?",
            options: [
              { id: "a", label: "Arus kas investasi" },
              { id: "b", label: "Beban operasional" },
              { id: "c", label: "Pendapatan" },
              { id: "d", label: "Ekuitas" },
            ],
            correctId: "a",
            explain:
              "Pembelian aset jangka panjang seperti mesin masuk arus kas investasi. Arus kas operasional hanya untuk aktivitas sehari-hari seperti jualan dan gaji.",
          },
          {
            type: "numeric",
            prompt:
              "Total piutang 30 juta dan pelanggan baru membayar 12 juta. Berapa sisa piutang yang belum tertagih?",
            numericUnit: "juta",
            acceptRangeMin: 17,
            acceptRangeMax: 19,
            explain:
              "Sisa piutang = 30 − 12 = 18 juta. Piutang besar itu kas yang belum masuk — semakin cepat tertagih, semakin sehat arus kas kamu.",
          },
          {
            type: "allocation",
            prompt:
              "Alokasikan kas bulanan kamu ke tiga pos: operasional, tabungan darurat, dan pengembangan usaha — dengan syarat tabungan darurat minimal 15%.",
            categories: ["Operasional", "Tabungan darurat", "Pengembangan usaha"],
            rule: { type: "min", categoryId: "Tabungan darurat", min: 15 },
            explain:
              "Tabungan darurat 15% atau lebih menjaga usaha tetap jalan saat penjualan lesu atau ada keperluan mendadak. Kas darurat adalah penjaga arus kas.",
          },
        ],
      },
    ],
  },

  // ── Manajemen Produk ────────────────────────────────────────────────────
  {
    title: "Manajemen Produk",
    description: "Temukan masalah, prioritaskan fitur, ukur metrik, validasi MVP.",
    imageUrl: "/unit/manajemen-produk.webp",
    lessons: [
      {
        title: "Mulai dari Masalah, Bukan dari Fitur",
        icon: "Search",
        screens: [
          {
            type: "choice",
            prompt: 'Orang sebenarnya tidak "membeli produk". Mereka membeli sesuatu untuk …',
            options: [
              { id: "a", label: "Menyelesaikan pekerjaan atau masalah tertentu" },
              { id: "b", label: "Mengoleksi fitur sebanyak mungkin" },
              { id: "c", label: "Membuat aplikasinya terlihat keren" },
              { id: "d", label: "Menebak fitur apa yang akan datang" },
            ],
            correctId: "a",
            explain:
              'Konsep jobs-to-be-done: orang "menyewa" produk untuk menyelesaikan pekerjaan. Kalau kamu paham masalahnya, fitur yang tepat akan terlihat dengan sendirinya.',
          },
          {
            type: "concept",
            prompt:
              "Banyak produk gagal bukan karena kualitasnya buruk, tapi karena memecahkan masalah yang tidak penting. Riset dimulai dari wawancara dan observasi pengguna, bukan dari mendesain layar.",
            explain:
              "Sebelum menulis fitur apa pun, tanyakan: masalah apa yang benar-benar dialami orang ini? Seberapa sering? Seberapa menyakitkan? Jawabannya menentukan apa yang layak dibangun.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu mewawancarai 40 calon pengguna dan 24 di antaranya mengalami masalah yang sama. Berapa persen yang mengalami masalah itu?",
            numericUnit: "persen",
            acceptRangeMin: 58,
            acceptRangeMax: 62,
            explain:
              "24 ÷ 40 × 100% = 60%. Enam dari sepuluh orang mengalami masalah yang sama — sinyal kuat bahwa ini bukan masalah satu-dua orang saja.",
          },
          {
            type: "choice",
            prompt: "Mana tanda paling kuat bahwa sebuah masalah layak diselesaikan?",
            options: [
              { id: "a", label: "Orang sudah membayar solusi lain (manual atau produk pesaing)" },
              { id: "b", label: "Ide solusinya terdengar canggih" },
              { id: "c", label: "Banyak fitur yang bisa ditambahkan" },
              { id: "d", label: "Tim developer sangat bersemangat" },
            ],
            correctId: "a",
            explain:
              "Kalau orang sudah mengeluarkan uang untuk menyelesaikan masalah ini, artinya ada permintaan nyata. Solusi manual yang merepotkan adalah peluang terbaik.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu mewawancarai 5 orang per minggu. Dalam 3 minggu, berapa total orang yang berhasil kamu wawancarai?",
            numericUnit: "orang",
            acceptRangeMin: 15,
            acceptRangeMax: 15,
            explain:
              "5 × 3 = 15 wawancara. Rangkaian wawancara kecil tapi rutin jauh lebih baik daripada satu riset besar yang hanya dilakukan sekali.",
          },
          {
            type: "allocation",
            prompt:
              "Alokasikan 100% waktu riset kamu ke tiga metode: wawancara, observasi lapangan, dan analisis data — dengan syarat wawancara minimal 40%.",
            categories: ["Wawancara", "Observasi", "Analisis data"],
            rule: { type: "min", categoryId: "Wawancara", min: 40 },
            explain:
              "Wawancara mengungkap alasan terdalam di balik perilaku, bukan hanya angka. Sebagian besar waktu riset sebaiknya dihabiskan mendengar langsung dari pengguna.",
          },
        ],
      },
      {
        title: "Memilih Fitur yang Paling Penting Dulu",
        icon: "ListFilter",
        screens: [
          {
            type: "choice",
            prompt:
              "Fitur A berdampak besar tapi butuh waktu lama. Fitur B dampaknya kecil tapi cepat selesai. Mana yang harus dikerjakan lebih dulu?",
            options: [
              { id: "a", label: "Tergantung perbandingan dampak dan effort-nya" },
              { id: "b", label: "Selalu A karena dampaknya besar" },
              { id: "c", label: "Selalu B karena cepat selesai" },
              { id: "d", label: "Kedua-duanya dikerjakan sekaligus" },
            ],
            correctId: "a",
            explain:
              "Prioritas bukan soal satu variabel saja. Fitur besar yang berdampak besar dan fitur kecil yang cepat sama-sama punya tempat — keduanya harus diukur dengan skor yang sama.",
          },
          {
            type: "concept",
            prompt:
              "Skor prioritas sederhana: Skor = Dampak × Jangkauan ÷ Effort. Dampak seberapa besar pengaruhnya, Jangkauan berapa banyak pengguna terkena dampaknya, Effort berapa besar usaha pengerjaannya.",
            explain:
              "Semakin tinggi skor, semakin cepat dikerjakan. Framework ini memaksa kamu membandingkan fitur secara adil, bukan berdasarkan pendapat paling keras di ruangan.",
          },
          {
            type: "numeric",
            prompt:
              "Fitur login dengan Google: dampak 5, jangkauan 100 pengguna, effort 4. Berapa skor prioritasnya?",
            numericUnit: "skor",
            acceptRangeMin: 120,
            acceptRangeMax: 130,
            explain:
              "Skor = 5 × 100 ÷ 4 = 125. Rumus ini menyeimbangkan nilai besar dan usaha pengerjaan dalam satu angka.",
          },
          {
            type: "choice",
            prompt:
              "Effort sebuah fitur naik (fitur jadi lebih sulit dikerjakan). Apa yang terjadi pada skor prioritasnya?",
            options: [
              { id: "a", label: "Skornya turun" },
              { id: "b", label: "Skornya naik" },
              { id: "c", label: "Skor tidak berubah" },
              { id: "d", label: "Dampaknya ikut naik" },
            ],
            correctId: "a",
            explain:
              "Effort ada di penyebut rumus. Semakin besar effort, semakin kecil skornya — fitur mahal butuh dampak besar untuk tetap layak dikerjakan.",
          },
          {
            type: "numeric",
            prompt:
              "Fitur pembayaran: dampak 4, jangkauan 200 pengguna, effort 5. Berapa skor prioritasnya?",
            numericUnit: "skor",
            acceptRangeMin: 155,
            acceptRangeMax: 165,
            explain:
              "Skor = 4 × 200 ÷ 5 = 160. Jangkauan yang besar menutupi dampak per pengguna yang sedang.",
          },
          {
            type: "allocation",
            prompt:
              "Dalam satu sprint, alokasikan 100% kapasitas tim ke tiga jenis pekerjaan: fitur inti, perbaikan bug, dan eksperimen — dengan syarat fitur inti minimal 50%.",
            categories: ["Fitur inti", "Perbaikan bug", "Eksperimen"],
            rule: { type: "min", categoryId: "Fitur inti", min: 50 },
            explain:
              "Sebagian besar kapasitas harus ke arah yang menaikkan skor prioritas tertinggi. Bug dan eksperimen tetap dikerjakan, tapi tidak boleh mengalahkan fitur inti.",
          },
        ],
      },
      {
        title: "Metrik yang Benar: Aktivasi dan Retensi",
        icon: "BarChart3",
        screens: [
          {
            type: "choice",
            prompt:
              "Aplikasi kamu diunduh 1.000 kali, tapi hanya 20 orang yang aktif minggu ini. Metrik mana yang paling penting untuk diperbaiki?",
            options: [
              { id: "a", label: "Pengguna aktif" },
              { id: "b", label: "Jumlah unduhan" },
              { id: "c", label: "Rating di toko aplikasi" },
              { id: "d", label: "Jumlah fitur yang dimiliki" },
            ],
            correctId: "a",
            explain:
              "Unduhan adalah metrik kesombongan (vanity metric). Yang menentukan keberhasilan adalah berapa banyak orang yang benar-benar memakai dan kembali menggunakan produk.",
          },
          {
            type: "concept",
            prompt:
              "Aktivasi adalah momen pengguna merasakan nilai pertama kali. Retensi adalah seberapa banyak pengguna yang kembali. Keduanya lebih penting daripada sekadar unduhan atau klik.",
            explain:
              'Satu metrik inti (north-star metric) seperti "jumlah sesi belajar selesai" menyatukan seluruh tim: engineering, desain, dan marketing bergerak ke arah angka yang sama.',
          },
          {
            type: "numeric",
            prompt:
              "1.000 orang mendaftar dan 300 di antaranya aktif minggu ini. Berapa persen aktivasi penggunanya?",
            numericUnit: "persen",
            acceptRangeMin: 28,
            acceptRangeMax: 32,
            explain:
              "Aktivasi = 300 ÷ 1.000 × 100% = 30%. Aktivasi yang rendah biasanya karena pengguna tidak menemukan nilai produk di kunjungan pertama.",
          },
          {
            type: "choice",
            prompt: "Retensi 50% pada minggu kedua berarti …",
            options: [
              { id: "a", label: "Setengah pengguna kembali menggunakan produk" },
              { id: "b", label: "Setengah fitur dipakai pengguna" },
              { id: "c", label: "Setengah unduhan berasal dari iklan" },
              { id: "d", label: "Setengah pengguna membayar" },
            ],
            correctId: "a",
            explain:
              "Retensi mengukur pengguna yang kembali. Kalau pengguna datang sekali lalu tidak pernah lagi, produk belum berhasil menciptakan kebiasaan.",
          },
          {
            type: "numeric",
            prompt:
              "200 pengguna aktif di minggu pertama, lalu 150 di antaranya kembali di minggu kedua. Berapa persen retensi minggu keduanya?",
            numericUnit: "persen",
            acceptRangeMin: 73,
            acceptRangeMax: 77,
            explain:
              "Retensi = 150 ÷ 200 × 100% = 75%. Tiga perempat pengguna kembali — angka retensi yang sehat.",
          },
          {
            type: "allocation",
            prompt:
              "Alokasikan 100% fokus tim ke tiga metrik: aktivasi, retensi, dan revenue — dengan syarat retensi minimal 40%.",
            categories: ["Aktivasi", "Retensi", "Revenue"],
            rule: { type: "min", categoryId: "Retensi", min: 40 },
            explain:
              "Menarik pengguna baru (akuisisi) itu mahal. Menaikkan retensi sering kali efeknya lebih besar pada pertumbuhan daripada menambah anggaran iklan.",
          },
        ],
      },
      {
        title: "MVP: Menguji Asumsi dengan Usaha Terkecil",
        icon: "Rocket",
        screens: [
          {
            type: "choice",
            prompt: "Apa tujuan utama sebuah MVP (minimum viable product)?",
            options: [
              { id: "a", label: "Menguji asumsi terbesar dengan usaha paling sedikit" },
              { id: "b", label: "Merilis produk dengan semua fitur lengkap" },
              { id: "c", label: "Membuat tampilan paling indah" },
              { id: "d", label: "Menghasilkan uang sebanyak-banyaknya" },
            ],
            correctId: "a",
            explain:
              "MVP bukan versi produk yang jelek — ini versi paling kecil yang cukup untuk menguji hipotesis paling berisiko sebelum menginvestasikan sumber daya besar.",
          },
          {
            type: "concept",
            prompt:
              "Siklus build-measure-learn: bangun versi kecil, ukur perilaku pengguna yang sesungguhnya, lalu belajar dan putuskan pivot atau lanjut. Kecepatan siklus ini adalah senjatamu.",
            explain:
              "MVP yang baik dirancang untuk memvalidasi asumsi, bukan untuk disempurnakan. Setiap siklus yang cepat membuat kamu belajar lebih banyak dengan uang yang lebih sedikit.",
          },
          {
            type: "numeric",
            prompt:
              "Produk lengkap butuh 8 minggu untuk dibangun, sementara MVP cukup 2 minggu. Berapa minggu yang bisa kamu hemat dengan menguji MVP dulu?",
            numericUnit: "minggu",
            acceptRangeMin: 5,
            acceptRangeMax: 7,
            explain:
              "8 − 2 = 6 minggu. Enam minggu itu waktu untuk menguji asumsi sebelum semua sumber daya terpakai untuk membangun yang belum tentu dibutuhkan.",
          },
          {
            type: "choice",
            prompt: "Setelah MVP diluncurkan, fokus utama kamu adalah …",
            options: [
              { id: "a", label: "Mengukur siapa yang memakai dan seberapa sering" },
              { id: "b", label: "Menambah fitur sebanyak mungkin" },
              { id: "c", label: "Menulis dokumentasi teknis" },
              { id: "d", label: "Merombak desain dari nol" },
            ],
            correctId: "a",
            explain:
              "Data penggunaan nyata adalah hasil utama MVP. Tambahkan fitur hanya setelah kamu memahami apa yang dipakai dan mengapa.",
          },
          {
            type: "numeric",
            prompt:
              "Dari 50 orang yang mencoba MVP, 10 memutuskan berlangganan. Berapa persen konversinya?",
            numericUnit: "persen",
            acceptRangeMin: 18,
            acceptRangeMax: 22,
            explain:
              "Konversi = 10 ÷ 50 × 100% = 20%. Satu dari lima mau membayar — cukup untuk melanjutkan sebelum membangun lebih banyak.",
          },
          {
            type: "allocation",
            prompt:
              "Alokasikan 100% waktu siklus pengembangan ke build, measure, dan learn — dengan syarat measure minimal 20%.",
            categories: ["Build", "Measure", "Learn"],
            rule: { type: "min", categoryId: "Measure", min: 20 },
            explain:
              "Membangun tanpa mengukur membuat kamu berjalan cepat ke arah yang salah. Sisihkan waktu khusus untuk mengukur dan memaknai hasil sebelum rilis berikutnya.",
          },
        ],
      },
    ],
  },

  // ── Kewirausahaan ───────────────────────────────────────────────────────
  {
    title: "Kewirausahaan",
    description: "Unit ekonomi, titik impas, harga, dan validasi ide.",
    imageUrl: "/unit/kewirausahaan.webp",
    lessons: [
      {
        title: "Unit Ekonomi: Untung dari Setiap Produk Terjual",
        icon: "Coins",
        screens: [
          {
            type: "choice",
            prompt:
              "Harga jual 50 ribu dan biaya untuk membuat satu produk 30 ribu. Berapa kontribusi per unit (selisihnya)?",
            options: [
              { id: "a", label: "20 ribu" },
              { id: "b", label: "30 ribu" },
              { id: "c", label: "50 ribu" },
              { id: "d", label: "80 ribu" },
            ],
            correctId: "a",
            explain:
              "Kontribusi per unit = harga jual − biaya variabel = 50 − 30 = 20 ribu. Inilah uang dari setiap unit yang bisa dipakai menutup biaya tetap seperti sewa.",
          },
          {
            type: "concept",
            prompt:
              "Unit ekonomi menjawab: apakah setiap produk yang kamu jual benar-benar menghasilkan uang? Rumus intinya: Kontribusi per unit = Harga jual − Biaya variabel.",
            explain:
              "Biaya variabel berubah sesuai jumlah produksi (bahan baku, kemasan). Biaya tetap seperti sewa dan gaji pokok tidak berubah. Kalau kontribusi tidak cukup, makin banyak jualan makin besar kerugiannya.",
          },
          {
            type: "numeric",
            prompt:
              "Kamu menjual 500 unit dan setiap unit menyumbang kontribusi 20 ribu. Berapa total kontribusi dari semua penjualan itu?",
            numericUnit: "juta",
            acceptRangeMin: 9.5,
            acceptRangeMax: 10.5,
            explain:
              "Total kontribusi = 500 × 20.000 = 10 juta. Angka ini dulu yang menutup biaya tetap, sisanya menjadi laba.",
          },
          {
            type: "choice",
            prompt:
              "Biaya tetap bulanan 5 juta dan kontribusi per unit 20 ribu. Berapa minimal unit yang harus terjual agar tidak rugi?",
            options: [
              { id: "a", label: "250 unit" },
              { id: "b", label: "100 unit" },
              { id: "c", label: "25 unit" },
              { id: "d", label: "1.000 unit" },
            ],
            correctId: "a",
            explain:
              "5.000.000 ÷ 20.000 = 250 unit. Di bawah 250 unit, kontribusi tidak cukup menutup biaya tetap dan bisnis rugi.",
          },
          {
            type: "numeric",
            prompt:
              "Biaya untuk mendapatkan satu pelanggan (CAC) 40 ribu dan nilai seumur hidup pelanggan (LTV) 200 ribu. Berapa rasio LTV:CAC?",
            numericUnit: "kali",
            acceptRangeMin: 4.5,
            acceptRangeMax: 5.5,
            explain:
              "LTV ÷ CAC = 200.000 ÷ 40.000 = 5. Bisnis sehat biasanya punya LTV minimal 3 kali CAC — di bawah itu akuisisi terlalu mahal.",
          },
          {
            type: "allocation",
            prompt:
              "Dari setiap 100 ribu harga jual, alokasikan ke biaya variabel, biaya tetap, dan laba — dengan syarat laba minimal 20%.",
            categories: ["Biaya variabel", "Biaya tetap", "Laba"],
            rule: { type: "min", categoryId: "Laba", min: 20 },
            explain:
              "Laba minimal 20% memastikan bisnis menghasilkan lebih dari sekadar memutar biaya. Kalau laba terlalu tipis, pertumbuhan sulit dibiayai.",
          },
        ],
      },
      {
        title: "Titik Impas (Break-Even)",
        icon: "Target",
        screens: [
          {
            type: "choice",
            prompt: "Titik impas (break-even) tercapai saat …",
            options: [
              { id: "a", label: "Total kontribusi menutup seluruh biaya tetap" },
              { id: "b", label: "Penjualan mencapai target maksimal" },
              { id: "c", label: "Semua produk habis terjual" },
              { id: "d", label: "Modal sudah kembali seluruhnya" },
            ],
            correctId: "a",
            explain:
              "Titik impas adalah saat pendapatan sudah menutup semua biaya — belum untung, tapi tidak lagi rugi. Semua penjualan setelah titik ini adalah laba murni.",
          },
          {
            type: "concept",
            prompt:
              "Rumus titik impas: Unit impas = Biaya tetap ÷ Kontribusi per unit. Angka ini menunjukkan berapa produk yang harus terjual agar biaya tertutup.",
            explain:
              "Contoh: biaya tetap 10 juta, kontribusi per unit 50 ribu. Unit impas = 10.000.000 ÷ 50.000 = 200 unit. Di bawah 200 unit berarti rugi.",
          },
          {
            type: "numeric",
            prompt:
              "Biaya tetap bulanan 12 juta dan kontribusi per unit 60 ribu. Berapa unit yang harus terjual untuk mencapai titik impas?",
            numericUnit: "unit",
            acceptRangeMin: 190,
            acceptRangeMax: 210,
            explain:
              "12.000.000 ÷ 60.000 = 200 unit. Kalau penjualan bulanan konsisten di atas 200, bisnis mulai menghasilkan laba.",
          },
          {
            type: "choice",
            prompt:
              "Kontribusi per unit naik (harga naik atau biaya turun). Apa yang terjadi pada jumlah unit impas?",
            options: [
              { id: "a", label: "Unit impas turun" },
              { id: "b", label: "Unit impas naik" },
              { id: "c", label: "Unit impas tidak berubah" },
              { id: "d", label: "Biaya tetap ikut naik" },
            ],
            correctId: "a",
            explain:
              "Kontribusi ada di penyebut. Semakin besar kontribusi per unit, semakin sedikit unit yang dibutuhkan untuk menutup biaya tetap.",
          },
          {
            type: "numeric",
            prompt:
              "Harga jual 100 ribu, biaya variabel per unit 40 ribu, dan biaya tetap 6 juta. Berapa unit impasnya?",
            numericUnit: "unit",
            acceptRangeMin: 95,
            acceptRangeMax: 105,
            explain: "Kontribusi = 100 − 40 = 60 ribu. Unit impas = 6.000.000 ÷ 60.000 = 100 unit.",
          },
          {
            type: "allocation",
            prompt:
              "Untuk menurunkan titik impas, alokasikan 100% strategi kamu ke tiga langkah: menaikkan harga, menurunkan biaya tetap, dan menurunkan biaya variabel — dengan syarat menurunkan biaya tetap minimal 30%.",
            categories: ["Naikkan harga", "Turunkan biaya tetap", "Turunkan biaya variabel"],
            rule: { type: "min", categoryId: "Turunkan biaya tetap", min: 30 },
            explain:
              "Biaya tetap adalah beban yang harus dibayar meski tidak ada penjualan. Menguranginya langsung menurunkan unit impas dan membuat bisnis lebih tahan banting.",
          },
        ],
      },
      {
        title: "Menentukan Harga Jual",
        icon: "Tag",
        screens: [
          {
            type: "choice",
            prompt: "Harga berbasis nilai (value-based pricing) berarti harga ditentukan dari …",
            options: [
              { id: "a", label: "Seberapa besar manfaat yang dirasakan pelanggan" },
              { id: "b", label: "Biaya produksi ditambah sekian persen" },
              { id: "c", label: "Harga paling murah di pasar" },
              { id: "d", label: "Perkiraan biaya pesaing" },
            ],
            correctId: "a",
            explain:
              "Produk yang menyelesaikan masalah senilai 1 juta per bulan bisa dijual jauh di atas biayanya. Harga mencerminkan nilai, bukan sekadar ongkos.",
          },
          {
            type: "concept",
            prompt:
              "Harga jual = Biaya + Margin. Tapi biaya hanyalah batas bawah. Batas atasnya adalah nilai yang dirasakan pelanggan. Harga yang baik berdiri di antara keduanya.",
            explain:
              "Menetapkan harga di bawah nilai membuat kamu meninggalkan uang di meja. Menetapkan harga di atas nilai membuat pelanggan pergi. Tahu nilai produk adalah kunci harga.",
          },
          {
            type: "numeric",
            prompt:
              "Biaya produksi satu produk 40 ribu dan kamu ingin margin 50% dari harga jual. Berapa harga jualnya?",
            numericUnit: "ribu",
            acceptRangeMin: 78,
            acceptRangeMax: 82,
            explain:
              "Kalau margin 50% dari harga, biaya 40 ribu adalah 50% dari harga. Harga = 40.000 ÷ 0,5 = 80 ribu.",
          },
          {
            type: "choice",
            prompt:
              "Pesaing menjual 100 ribu dan produkmu jelas lebih baik. Strategi harga yang paling masuk akal?",
            options: [
              { id: "a", label: "Harga sedikit di atas pesaing sambil mengkomunikasikan nilai" },
              { id: "b", label: "Harga setengah dari pesaing agar laku" },
              { id: "c", label: "Harga sama persis dengan pesaing" },
              { id: "d", label: "Gratis untuk semua orang" },
            ],
            correctId: "a",
            explain:
              'Harga premium yang jelas beralasan menandakan kualitas lebih baik. Harga terlalu murah justru sering dianggap "terlalu bagus untuk jadi kenyataan".',
          },
          {
            type: "numeric",
            prompt: "Harga jual 120 ribu dan biaya 80 ribu. Berapa persen margin kotornya?",
            numericUnit: "persen",
            acceptRangeMin: 31,
            acceptRangeMax: 35,
            explain:
              "Margin = (120 − 80) ÷ 120 × 100% = 33%. Setiap penjualan menyisakan sepertiga dari harga untuk biaya tetap dan laba.",
          },
          {
            type: "allocation",
            prompt:
              "Dari setiap 100 ribu harga jual, alokasikan ke biaya produksi, pemasaran, dan keuntungan — dengan syarat keuntungan minimal 25%.",
            categories: ["Biaya produksi", "Pemasaran", "Keuntungan"],
            rule: { type: "min", categoryId: "Keuntungan", min: 25 },
            explain:
              "Keuntungan minimal 25% menjaga bisnis tetap bisa tumbuh dan menahan risiko. Kalau keuntungannya tipis, harga perlu dievaluasi ulang.",
          },
        ],
      },
      {
        title: "Validasi Ide sebelum Mengeluarkan Uang",
        icon: "Lightbulb",
        screens: [
          {
            type: "choice",
            prompt:
              "Kamu punya ide usaha yang terasa brilian. Langkah paling murah untuk mengujinya sebelum membangun?",
            options: [
              { id: "a", label: "Wawancara dan menawarkan pre-order ke calon pelanggan" },
              { id: "b", label: "Langsung membangun produk lengkap" },
              { id: "c", label: "Meminjam uang untuk sewa tempat" },
              { id: "d", label: 'Menunggu ide "sempurna" dulu' },
            ],
            correctId: "a",
            explain:
              "Wawancara dan pre-order memberi bukti permintaan sebelum modal besar keluar. Kalau calon pelanggan bersedia memesan di muka, permintaannya nyata.",
          },
          {
            type: "concept",
            prompt:
              'Validasi adalah mencari tahu apakah orang benar-benar mau membayar, bukan hanya bilang "ide bagus". Alat termurah: wawancara, landing page, dan pre-order.',
            explain:
              "Pujian itu gratis dan tidak mengikat. Uang di muka adalah bukti paling jujur bahwa masalahnya nyata dan solusimu dihargai.",
          },
          {
            type: "numeric",
            prompt:
              "Dari 20 orang yang diwawancarai, 12 bersedia membayar di muka untuk produkmu. Berapa persen yang memberi sinyal permintaan?",
            numericUnit: "persen",
            acceptRangeMin: 58,
            acceptRangeMax: 62,
            explain:
              '12 ÷ 20 × 100% = 60%. Enam dari sepuluh bersedia mengeluarkan uang — sinyal jauh lebih kuat daripada sekadar "tertarik".',
          },
          {
            type: "choice",
            prompt: "Mana bukti terkuat bahwa sebuah ide layak dikejar?",
            options: [
              { id: "a", label: "Orang sudah membayar pre-order" },
              { id: "b", label: "Teman-teman bilang idenya bagus" },
              { id: "c", label: "Ide ini sedang tren di media sosial" },
              { id: "d", label: "Kamu sendiri sangat yakin" },
            ],
            correctId: "a",
            explain:
              "Uang di muka adalah sinyal paling kuat. Pujian dan tren tidak menjamin orang akan mengeluarkan uang ketika waktunya tiba.",
          },
          {
            type: "numeric",
            prompt:
              "Harga pre-order 50 ribu dan 30 orang memesan di muka. Berapa total uang yang berhasil dikumpulkan?",
            numericUnit: "juta",
            acceptRangeMin: 1.4,
            acceptRangeMax: 1.6,
            explain:
              "30 × 50.000 = 1,5 juta. Uang di muka ini membuktikan permintaan sekaligus mendanai tahap awal pengembangan.",
          },
          {
            type: "allocation",
            prompt:
              "Alokasikan 100% anggaran validasi ke riset pasar, prototipe, dan iklan kecil — dengan syarat riset pasar minimal 30%.",
            categories: ["Riset pasar", "Prototipe", "Iklan kecil"],
            rule: { type: "min", categoryId: "Riset pasar", min: 30 },
            explain:
              "Riset pasar yang cukup memastikan kamu memahami masalah sebelum memproduksi. Iklan kecil menguji permintaan dengan uang yang terkendali.",
          },
        ],
      },
    ],
  },
];
