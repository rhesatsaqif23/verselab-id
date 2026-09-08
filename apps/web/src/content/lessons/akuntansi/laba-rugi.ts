// Accounting lesson 3: the income statement (untung vs rugi).
import type { Lesson } from "#/engine/types.ts";

export const labaRugiLesson: Lesson = {
  id: "laba-rugi",
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
      unit: "juta",
      acceptRange: [24, 26],
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
      unit: "persen",
      acceptRange: [24, 26],
      explain:
        "Margin laba = laba ÷ pendapatan × 100% = 50 ÷ 200 × 100% = 25%. Setiap 100 ribu penjualan menyisakan 25 ribu laba.",
    },
    {
      type: "allocation",
      prompt:
        "Dari setiap 100 rupiah penjualan, bagi ke tiga pos: biaya bahan baku, biaya operasional, dan laba — dengan syarat laba minimal 15%.",
      categories: ["Biaya bahan baku", "Biaya operasional", "Laba"],
      rule: { category: "Laba", min: 15 },
      explain:
        "Kalau laba kurang dari 15%, usaha hampir tidak menyisakan hasil untuk pemilik. Bagi yang sehat biasanya menyisakan laba cukup untuk tumbuh dan menjaga kas.",
    },
  ],
};
