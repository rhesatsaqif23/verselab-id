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
  id: string;
  title: string;
  description?: string;
  prerequisiteIds?: string[];
  /** Path to an illustration under assets/ (repo root), uploaded at seed time. */
  imageAsset?: string;
  screens: SeedScreen[];
};

type SeedUnit = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  /** Path to an illustration under assets/ (repo root), uploaded at seed time. */
  imageAsset?: string;
  lessons: SeedLesson[];
};

export const seedUnits: SeedUnit[] = [
  // ── Keuangan ────────────────────────────────────────────────────────────
  {
    id: "keuangan",
    title: "Keuangan",
    description: "Menabung, anggaran, cicilan, dan nilai waktu uang.",
    imageAsset: "Batch 1/UI_Batch1_Card.png",
    lessons: [
      {
        id: "arus-kas-dasar",
        title: "Arus Kas Dasar",
        description: "Bedakan uang masuk dan keluar, lalu hitung sisanya setiap bulan.",
        imageAsset: "Batch 2/Keu_Cashflow.png",
        screens: [
          {
            type: "choice",
            prompt:
              "Budi gajian Rp 5.000.000. Ia menghabiskan Rp 4.200.000 untuk semua kebutuhan bulan itu. Berapa arus kas bersihnya?",
            options: [
              { id: "a", label: "Rp 800.000" },
              { id: "b", label: "Rp 4.200.000" },
              { id: "c", label: "Rp 9.200.000" },
            ],
            correctId: "a",
            explain:
              "5.000.000 dikurangi 4.200.000 sama dengan 800.000. Sisanya positif, jadi Budi surplus bulan ini.",
          },
          {
            type: "numeric",
            prompt:
              "Penghasilanmu Rp 6.000.000, pengeluaranmu Rp 4.500.000. Berapa rupiah sisanya?",
            numericUnit: "Rupiah",
            acceptRangeMin: 1500000,
            acceptRangeMax: 1500000,
            explain: "6.000.000 dikurangi 4.500.000 sama dengan 1.500.000.",
          },
          {
            type: "concept",
            prompt:
              "Dua orang gajinya sama. Yang satu selalu punya sisa, yang lain selalu habis sebelum gajian. Bedanya bukan gaji, tapi selisih antara uang masuk dan uang keluar.",
            explain:
              "Itulah yang disebut Arus Kas (cashflow): uang masuk dikurangi uang keluar dalam satu periode. Positif berarti surplus, negatif berarti defisit.",
          },
          {
            type: "numeric",
            prompt:
              "Sisamu Rp 800.000 per bulan. Jika polanya sama, berapa total yang terkumpul dalam setahun?",
            numericUnit: "Rupiah",
            acceptRangeMin: 9600000,
            acceptRangeMax: 9600000,
            explain: "800.000 dikali 12 bulan sama dengan 9.600.000.",
          },
          {
            type: "allocation",
            prompt: "Gaji Rp 5.000.000. Atur pembagiannya ke tiga pos ini:",
            categories: ["Kebutuhan", "Keinginan", "Tabungan"],
            rule: { type: "min", categoryId: "Tabungan", min: 20 },
            explain: "Sisihkan minimal 20% untuk tabungan sebelum membelanjakan sisanya.",
          },
          {
            type: "allocation",
            prompt: "Pengeluaran Rp 4.000.000. Atur pembagiannya:",
            categories: ["Sewa", "Makan", "Transport", "Tabungan"],
            rule: { type: "min", categoryId: "Tabungan", min: 10 },
            explain:
              "Sekecil apa pun, tabungan harus selalu dapat porsi. Minimal 10% dari pengeluaran.",
          },
        ],
      },
      {
        id: "anggaran",
        title: "Anggaran & Prioritas",
        description: "Bagi penghasilan ke pos-pos dengan porsi yang masuk akal.",
        imageAsset: "Batch 2/Keu_Budget.png",
        prerequisiteIds: ["arus-kas"],
        screens: [
          {
            type: "numeric",
            prompt:
              "Gaji Rp 7.500.000. Dengan aturan 50/30/20, berapa rupiah jatah kebutuhan (50%)?",
            numericUnit: "Rupiah",
            acceptRangeMin: 3750000,
            acceptRangeMax: 3750000,
            explain: "50% dari 7.500.000 sama dengan 3.750.000.",
          },
          {
            type: "choice",
            prompt:
              "Pengeluaranmu overbudget bulan ini. Pos mana yang paling tepat dipotong duluan?",
            options: [
              { id: "a", label: "Langganan yang jarang dipakai" },
              { id: "b", label: "Makan pokok" },
              { id: "c", label: "Sewa kontrakan" },
            ],
            correctId: "a",
            explain:
              "Potong dulu pengeluaran yang tidak mengganggu hidup: langganan yang jarang dipakai.",
          },
          {
            type: "concept",
            prompt:
              "Tanpa rencana, uang habis tanpa jejak setiap bulan. Dengan rencana, tiap rupiah punya tugas sebelum ia dibelanjakan.",
            explain:
              "Itulah gunanya Anggaran (budgeting): rencana pembagian penghasilan ke pos-pos kebutuhan, keinginan, dan tabungan.",
          },
          {
            type: "numeric",
            prompt: "Dengan aturan yang sama, berapa rupiah jatah tabungan (20%)?",
            numericUnit: "Rupiah",
            acceptRangeMin: 1500000,
            acceptRangeMax: 1500000,
            explain: "20% dari 7.500.000 sama dengan 1.500.000.",
          },
          {
            type: "allocation",
            prompt: "Gaji Rp 7.500.000. Atur pembagiannya:",
            categories: ["Kebutuhan", "Keinginan", "Tabungan"],
            rule: { type: "min", categoryId: "Tabungan", min: 20 },
            explain: "Ikuti aturan 50/30/20: kebutuhan 50%, keinginan 30%, tabungan 20%.",
          },
          {
            type: "allocation",
            prompt: "Uang jajan Rp 1.000.000. Atur pembagiannya:",
            categories: ["Makan", "Hiburan", "Belanja", "Tabungan"],
            rule: { type: "min", categoryId: "Tabungan", min: 15 },
            explain: "Bahkan uang jajan pun perlu pos tabungan. Minimal 15%.",
          },
        ],
      },
      {
        id: "dana-darurat",
        title: "Dana Darurat",
        description: "Siapkan bantalan 3–6 bulan pengeluaran untuk hal tak terduga.",
        imageAsset: "Batch 2/Keu_Emergency.png",
        prerequisiteIds: ["anggaran"],
        screens: [
          {
            type: "choice",
            prompt: "Berapa dana darurat yang ideal untuk karyawan tetap?",
            options: [
              { id: "a", label: "1 bulan pengeluaran" },
              { id: "b", label: "3–6 bulan pengeluaran" },
              { id: "c", label: "12 bulan penuh" },
            ],
            correctId: "b",
            explain: "3–6 bulan pengeluaran cukup untuk menutup PHK atau sakit tanpa berutang.",
          },
          {
            type: "numeric",
            prompt: "Pengeluaranmu Rp 4.000.000 per bulan. Berapa target dana darurat 6 bulan?",
            numericUnit: "Rupiah",
            acceptRangeMin: 24000000,
            acceptRangeMax: 24000000,
            explain: "4.000.000 dikali 6 sama dengan 24.000.000.",
          },
          {
            type: "concept",
            prompt:
              "Motor mogok, HP hilang, semuanya di bulan yang sama. Tanpa bantalan, satu kejadian saja bisa memaksamu berutang.",
            explain:
              "Dana Darurat adalah simpanan khusus untuk kejadian tak terduga: 3–6 bulan pengeluaran, disimpan terpisah dan mudah dicairkan.",
          },
          {
            type: "numeric",
            prompt:
              "Targetmu Rp 24.000.000 dan sudah terkumpul Rp 10.000.000. Berapa kekurangannya?",
            numericUnit: "Rupiah",
            acceptRangeMin: 14000000,
            acceptRangeMax: 14000000,
            explain: "24.000.000 dikurangi 10.000.000 sama dengan 14.000.000.",
          },
          {
            type: "allocation",
            prompt: "Dari Rp 2.000.000 per bulan, alokasikan untuk keamanan finansialmu:",
            categories: ["Dana Darurat", "Investasi", "Hiburan"],
            rule: { type: "min", categoryId: "Dana Darurat", min: 50 },
            explain: "Sebelum berinvestasi, penuhi dulu dana darurat. Minimal setengahnya ke sana.",
          },
          {
            type: "allocation",
            prompt: "Alokasikan THR Rp 6.000.000:",
            categories: ["Tabungan", "Dana Darurat", "Donasi"],
            rule: { type: "min", categoryId: "Dana Darurat", min: 30 },
            explain: "Uang kaget paling tepat mempercepat dana darurat. Minimal 30%.",
          },
        ],
      },
      {
        id: "utang",
        title: "Utang & Bunga",
        description: "Pahami cara bunga membuat utang membesar dan cara melunasinya.",
        imageAsset: "Batch 2/Keu_Debt.png",
        prerequisiteIds: ["dana-darurat"],
        screens: [
          {
            type: "numeric",
            prompt:
              "Utangmu Rp 10.000.000 dengan bunga 2% per bulan. Berapa rupiah bunganya di bulan pertama?",
            numericUnit: "Rupiah",
            acceptRangeMin: 200000,
            acceptRangeMax: 200000,
            explain: "2% dari 10.000.000 sama dengan 200.000.",
          },
          {
            type: "choice",
            prompt: "Punya dua utang. Mana yang dilunasi duluan?",
            options: [
              { id: "a", label: "Yang bunganya tertinggi" },
              { id: "b", label: "Yang nominalnya terbesar" },
              { id: "c", label: "Yang bunganya terendah" },
            ],
            correctId: "a",
            explain:
              "Lunasi dulu utang berbunga tertinggi (metode avalanche) agar total bunga paling kecil.",
          },
          {
            type: "concept",
            prompt:
              "Utang 10 juta bisa jadi 12 juta kalau dibiarkan. Kelebihannya bukan denda, tapi harga yang kamu bayar karena meminjam.",
            explain:
              "Itulah Bunga: biaya meminjam uang, dihitung sebagai persen dari sisa utang setiap periodenya.",
          },
          {
            type: "numeric",
            prompt:
              "Cicilanmu Rp 1.000.000 per bulan dan Rp 300.000 di antaranya adalah bunga. Berapa pokok utang yang terbayar?",
            numericUnit: "Rupiah",
            acceptRangeMin: 700000,
            acceptRangeMax: 700000,
            explain: "1.000.000 dikurangi 300.000 sama dengan 700.000.",
          },
          {
            type: "allocation",
            prompt: "Gaji Rp 5.000.000 selagi masih punya utang:",
            categories: ["Cicilan Utang", "Kebutuhan", "Tabungan"],
            rule: { type: "min", categoryId: "Cicilan Utang", min: 30 },
            explain: "Percepat pelunasan: minimal 30% penghasilan untuk cicilan.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 3.000.000 untuk dua utang dan tabungan:",
            categories: ["Utang Bunga Tinggi", "Utang Bunga Rendah", "Tabungan"],
            rule: { type: "min", categoryId: "Utang Bunga Tinggi", min: 40 },
            explain: "Fokuskan minimal 40% ke utang berbunga tinggi.",
          },
        ],
      },
      {
        id: "bunga-berbunga",
        title: "Bunga Berbunga",
        description: "Biarkan waktu melipatgandakan uangmu lewat bunga berbunga.",
        imageAsset: "Batch 2/Keu_Compound.png",
        prerequisiteIds: ["utang"],
        screens: [
          {
            type: "choice",
            prompt:
              "Rp 10.000.000 berkembang 10% per tahun selama 2 tahun dengan bunga berbunga. Berapa totalnya?",
            options: [
              { id: "a", label: "Rp 12.100.000" },
              { id: "b", label: "Rp 12.000.000" },
              { id: "c", label: "Rp 11.000.000" },
            ],
            correctId: "a",
            explain:
              "Tahun pertama jadi 11 juta, tahun kedua 10% dari 11 juta. Total 10 juta dikali 1,1 kuadrat sama dengan 12,1 juta.",
          },
          {
            type: "numeric",
            prompt:
              "Rp 5.000.000 berkembang 10% dalam setahun. Berapa saldonya di akhir tahun pertama?",
            numericUnit: "Rupiah",
            acceptRangeMin: 5500000,
            acceptRangeMax: 5500000,
            explain: "5.000.000 ditambah 10% sama dengan 5.500.000.",
          },
          {
            type: "concept",
            prompt:
              "Tahun pertama untung 500 ribu, tahun kedua 550 ribu, padahal persennya sama. Kelebihannya datang dari bunga yang ikut dibungakan.",
            explain:
              "Itulah Bunga Berbunga (compound interest): bunga ikut menghasilkan bunga, sehingga pertumbuhan makin cepat dari tahun ke tahun.",
          },
          {
            type: "numeric",
            prompt: "Lanjut ke tahun kedua dengan 10% lagi dari Rp 5.500.000. Berapa saldonya?",
            numericUnit: "Rupiah",
            acceptRangeMin: 6050000,
            acceptRangeMax: 6050000,
            explain: "5.500.000 ditambah 10% sama dengan 6.050.000.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 4.000.000 agar uangmu ikut bertumbuh:",
            categories: ["Belanja", "Tabungan Berbunga"],
            rule: { type: "min", categoryId: "Tabungan Berbunga", min: 25 },
            explain: "Minimal seperempat penghasilan masuk ke tempat yang berbunga.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 10.000.000 untuk masa depan:",
            categories: ["Kebutuhan", "Tabungan", "Investasi"],
            rule: { type: "min", categoryId: "Investasi", min: 20 },
            explain: "Investasi rutin adalah bahan bakar bunga berbunga. Minimal 20%.",
          },
        ],
      },
      {
        id: "inflasi",
        title: "Inflasi",
        description: "Kenali musuh diam-diam yang menggerus daya beli uangmu.",
        imageAsset: "Batch 2/Keu_Inflation.png",
        prerequisiteIds: ["bunga-berbunga"],
        screens: [
          {
            type: "numeric",
            prompt: "Harga barang Rp 100.000 dan inflasi 5%. Berapa harganya tahun depan?",
            numericUnit: "Rupiah",
            acceptRangeMin: 105000,
            acceptRangeMax: 105000,
            explain: "100.000 ditambah 5% sama dengan 105.000.",
          },
          {
            type: "choice",
            prompt: "Tabunganmu berbunga 2% sementara inflasi 5%. Apa yang terjadi pada uangmu?",
            options: [
              { id: "a", label: "Nilainya tetap" },
              { id: "b", label: "Nilainya naik" },
              { id: "c", label: "Daya belinya turun" },
            ],
            correctId: "c",
            explain:
              "Hasil bersih kira-kira 2% dikurangi 5% sama dengan minus 3%. Uangmu menyusut diam-diam.",
          },
          {
            type: "concept",
            prompt:
              "Tahun lalu bakso 10 ribu, sekarang 12 ribu. Uangmu sama, tapi dapatnya makin sedikit.",
            explain: "Itulah Inflasi: kenaikan harga umum yang menggerus daya beli uang yang diam.",
          },
          {
            type: "numeric",
            prompt:
              "Rp 10.000.000 didiamkan setahun dengan inflasi 4%. Kira-kira setara berapa daya belinya sekarang?",
            numericUnit: "Rupiah",
            acceptRangeMin: 9550000,
            acceptRangeMax: 9650000,
            explain: "10.000.000 dikali 96% sama dengan kira-kira 9.600.000.",
          },
          {
            type: "allocation",
            prompt: "Lindungi Rp 8.000.000 dari inflasi:",
            categories: ["Kas", "Deposito", "Investasi"],
            rule: { type: "min", categoryId: "Investasi", min: 20 },
            explain: "Kas tergerus inflasi. Minimal 20% harus bekerja mengalahkannya.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 5.000.000 agar tahan inflasi:",
            categories: ["Tabungan", "Emas", "Saham"],
            rule: { type: "min", categoryId: "Saham", min: 30 },
            explain: "Aset produktif melawan inflasi. Minimal 30% ke saham.",
          },
        ],
      },
      {
        id: "investasi",
        title: "Menabung vs Investasi",
        description: "Pilih kendaraan yang tepat sesuai jangka waktumu.",
        imageAsset: "Batch 2/Keu_Invest.png",
        prerequisiteIds: ["inflasi"],
        screens: [
          {
            type: "choice",
            prompt: "Tujuanmu 10 tahun lagi. Kendaraan mana yang paling cocok?",
            options: [
              { id: "a", label: "Kas di rumah" },
              { id: "b", label: "Tabungan biasa" },
              { id: "c", label: "Reksa dana saham" },
            ],
            correctId: "c",
            explain:
              "Jangka panjang menoleransi naik-turun saham demi hasil yang mengalahkan inflasi.",
          },
          {
            type: "numeric",
            prompt: "Kamu menyisihkan Rp 1.000.000 per bulan. Berapa setoran setahun?",
            numericUnit: "Rupiah",
            acceptRangeMin: 12000000,
            acceptRangeMax: 12000000,
            explain: "1.000.000 dikali 12 sama dengan 12.000.000.",
          },
          {
            type: "concept",
            prompt:
              "Menabung menjaga uang tetap ada. Tapi ada cara membuat uang bekerja dan bertumbuh, dengan risiko yang sepadan.",
            explain:
              "Itulah Investasi: menaruh uang di aset yang diharapkan tumbuh nilainya, imbalannya sepadan dengan risikonya.",
          },
          {
            type: "numeric",
            prompt: "Investasimu Rp 10.000.000 untung 12%. Berapa rupiah keuntungannya?",
            numericUnit: "Rupiah",
            acceptRangeMin: 1200000,
            acceptRangeMax: 1200000,
            explain: "12% dari 10.000.000 sama dengan 1.200.000.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 6.000.000 sesuai jangka waktu:",
            categories: ["Tabungan", "Deposito", "Saham"],
            rule: { type: "min", categoryId: "Saham", min: 20 },
            explain: "Jangka panjang boleh agresif. Minimal 20% ke saham.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 10.000.000 untuk tiga tujuan:",
            categories: ["Kebutuhan", "Tabungan", "Investasi"],
            rule: { type: "min", categoryId: "Investasi", min: 25 },
            explain: "Sisihkan minimal seperempat untuk tujuan jangka panjang.",
          },
        ],
      },
      {
        id: "diversifikasi",
        title: "Diversifikasi",
        description: "Sebar uang ke beberapa aset agar tetap aman.",
        imageAsset: "Batch 2/Keu_Diversity.png",
        prerequisiteIds: ["investasi"],
        screens: [
          {
            type: "choice",
            prompt: "Mana yang lebih aman: semua uang di 1 saham, atau dibagi ke 5 aset?",
            options: [
              { id: "a", label: "Semua di 1 saham" },
              { id: "b", label: "Dibagi ke 5 aset" },
              { id: "c", label: "Sama saja" },
            ],
            correctId: "b",
            explain: "Satu aset jatuh tidak menghancurkan semuanya kalau uang tersebar.",
          },
          {
            type: "numeric",
            prompt: "Rp 20.000.000 dibagi rata ke 4 aset. Berapa per aset?",
            numericUnit: "Rupiah",
            acceptRangeMin: 5000000,
            acceptRangeMax: 5000000,
            explain: "20.000.000 dibagi 4 sama dengan 5.000.000.",
          },
          {
            type: "concept",
            prompt:
              "Satu saham jatuh 20%, seluruh uang ikut jatuh 20%. Padahal kejatuhan itu bisa ditahan kalau uangnya tersebar.",
            explain:
              "Itulah Diversifikasi: membagi uang ke beberapa aset agar satu kejatuhan tidak menghancurkan semuanya.",
          },
          {
            type: "numeric",
            prompt: "Satu aset Rp 5.000.000 turun 10%. Berapa rupiah kerugiannya?",
            numericUnit: "Rupiah",
            acceptRangeMin: 500000,
            acceptRangeMax: 500000,
            explain: "10% dari 5.000.000 sama dengan 500.000. Kecil karena porsinya kecil.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 20.000.000 ke empat kelas aset:",
            categories: ["Saham", "Obligasi", "Emas", "Kas"],
            rule: { type: "min", categoryId: "Obligasi", min: 20 },
            explain: "Obligasi menstabilkan portofolio. Minimal 20% di sana.",
          },
          {
            type: "allocation",
            prompt: "Bagi Rp 10.000.000 dengan aman:",
            categories: ["Saham A", "Saham B", "Obligasi"],
            rule: { type: "min", categoryId: "Obligasi", min: 30 },
            explain: "Jangan semua saham. Minimal 30% di obligasi sebagai penyeimbang.",
          },
        ],
      },
    ],
  },

  // ── Akuntansi ───────────────────────────────────────────────────────────
  {
    id: "akuntansi",
    title: "Akuntansi",
    description: "Persamaan dasar, pencatatan transaksi, laba rugi, dan arus kas.",
    imageUrl: "/unit/akuntansi.webp",
    lessons: [
      {
        id: "persamaan",
        title: "Persamaan Dasar: Aset, Utang, dan Modal",
        description: "Pelajari fondasi akuntansi: hubungan antara aset, utang, dan modal.",
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
        id: "transaksi",
        title: "Mencatat Transaksi: Debit dan Kredit",
        description:
          "Cara mencatat setiap transaksi bisnis dengan benar menggunakan debit dan kredit.",
        prerequisiteIds: ["persamaan"],
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
        id: "laba-rugi",
        title: "Laporan Laba Rugi: Untung atau Rugi",
        description: "Baca laporan laba rugi untuk mengetahui apakah bisnis kamu menguntungkan.",
        prerequisiteIds: ["transaksi"],
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
        id: "arus-kas",
        title: "Arus Kas: Uang yang Benar-Benar Masuk dan Keluar",
        description: "Pahami perbedaan antara laba dan arus kas aktual dalam bisnis.",
        prerequisiteIds: ["laba-rugi"],
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
    id: "manajemen-produk",
    title: "Manajemen Produk",
    description: "Temukan masalah, prioritaskan fitur, ukur metrik, validasi MVP.",
    imageUrl: "/unit/manajemen-produk.webp",
    lessons: [
      {
        id: "menemukan-masalah",
        title: "Mulai dari Masalah, Bukan dari Fitur",
        description: "Temukan masalah nyata pengguna sebelum mulai membangun solusi.",
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
        id: "prioritas-fitur",
        title: "Memilih Fitur yang Paling Penting Dulu",
        description:
          "Rencanakan fitur mana yang harus dibangun terlebih dahulu berdasarkan dampak.",
        prerequisiteIds: ["menemukan-masalah"],
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
        id: "metrik-produk",
        title: "Metrik yang Benar: Aktivasi dan Retensi",
        description: "Ukur keberhasilan produk kamu dengan metrik yang tepat.",
        prerequisiteIds: ["prioritas-fitur"],
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
        id: "mvp-validasi",
        title: "MVP: Menguji Asumsi dengan Usaha Terkecil",
        description: "Bangun MVP untuk menguji asumsi bisnis dengan modal seminimal mungkin.",
        prerequisiteIds: ["metrik-produk"],
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
    id: "kewirausahaan",
    title: "Kewirausahaan",
    description: "Unit ekonomi, titik impas, harga, dan validasi ide.",
    imageUrl: "/unit/kewirausahaan.webp",
    lessons: [
      {
        id: "unit-ekonomi",
        title: "Unit Ekonomi: Untung dari Setiap Produk Terjual",
        description: "Hitung margin dan keuntungan dari setiap unit produk yang kamu jual.",
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
        id: "titik-impas",
        title: "Titik Impas (Break-Even)",
        description: "Tahu kapan bisnis kamu mulai menguntungkan dan menutup semua biaya.",
        prerequisiteIds: ["unit-ekonomi"],
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
        id: "menentukan-harga",
        title: "Menentukan Harga Jual",
        description: "Strategi menentukan harga jual yang tepat untuk produk kamu.",
        prerequisiteIds: ["titik-impas"],
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
        id: "validasi-ide",
        title: "Validasi Ide sebelum Mengeluarkan Uang",
        description: "Uji ide bisnis kamu sebelum menghabiskan uang untuk membangunnya.",
        prerequisiteIds: ["menentukan-harga"],
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
