// Lesson: Nilai Waktu Uang — understanding inflation and purchasing power.
import type { Lesson } from "#/engine/types.ts";

export const nilaiWaktuUangLesson: Lesson = {
  id: "nilai-waktu-uang",
  title: "Uang sekarang vs masa depan",
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
      unit: "ribu",
      acceptRange: [57, 59],
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
      prompt: "Gaji kamu 8 juta per bulan. Alokasikan ke tiga pos ini. Tabungan harus minimal 20%.",
      categories: ["Kebutuhan pokok", "Investasi", "Tabungan darurat"],
      rule: { category: "Tabungan darurat", min: 20 },
      explain:
        "Tabungan darurat minimal 3-6 bulan pengeluaran. Setelah terpenuhi, lebih bisa dialihkan ke investasi.",
    },
    {
      type: "numeric",
      prompt:
        "Kamu investasi Rp 2 juta per bulan dengan return 8% per tahun. Setelah 5 tahun, total uang kamu sekitar berapa? (dalam juta)",
      unit: "juta",
      acceptRange: [143, 150],
      explain:
        "Setoran total Rp 120 juta, tapi jadi sekitar 146 juta. Bunga berbunga bikin investasi tumbuh lebih cepat dari sekadar nabung.",
    },
  ],
};
