// Lesson: Hutang & Cicilan — understanding interest on loans.
import type { Lesson } from "#/engine/types.ts";

export const hutangCicilanLesson: Lesson = {
  id: "hutang-cicilan",
  title: "Memahami bunga pinjaman",
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
      unit: "juta",
      acceptRange: [6, 6.1],
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
      rule: { category: "Tabungan darurat", min: 15 },
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
};
