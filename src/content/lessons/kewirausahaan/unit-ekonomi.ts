// Entrepreneurship lesson 1: unit economics — margin per product.
import type { Lesson } from "#/engine/types.ts";

export const unitEkonomiLesson: Lesson = {
  id: "unit-ekonomi",
  title: "Unit ekonomi: untung dari setiap produk terjual",
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
      unit: "juta",
      acceptRange: [9.5, 10.5],
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
      unit: "kali",
      acceptRange: [4.5, 5.5],
      explain:
        "LTV ÷ CAC = 200.000 ÷ 40.000 = 5. Bisnis sehat biasanya punya LTV minimal 3 kali CAC — di bawah itu akuisisi terlalu mahal.",
    },
    {
      type: "allocation",
      prompt:
        "Dari setiap 100 ribu harga jual, alokasikan ke biaya variabel, biaya tetap, dan laba — dengan syarat laba minimal 20%.",
      categories: ["Biaya variabel", "Biaya tetap", "Laba"],
      rule: { category: "Laba", min: 20 },
      explain:
        "Laba minimal 20% memastikan bisnis menghasilkan lebih dari sekadar memutar biaya. Kalau laba terlalu tipis, pertumbuhan sulit dibiayai.",
    },
  ],
};
