// Entrepreneurship lesson 2: break-even point.
import type { Lesson } from '#/engine/types.ts'

export const wirausahaBreakEvenLesson: Lesson = {
  id: 'wirausaha-break-even-1',
  title: 'Titik impas (break-even)',
  screens: [
    {
      type: 'choice',
      prompt:
        'Titik impas (break-even) tercapai saat …',
      options: [
        { id: 'a', label: 'Total kontribusi menutup seluruh biaya tetap' },
        { id: 'b', label: 'Penjualan mencapai target maksimal' },
        { id: 'c', label: 'Semua produk habis terjual' },
        { id: 'd', label: 'Modal sudah kembali seluruhnya' },
      ],
      correctId: 'a',
      explain:
        'Titik impas adalah saat pendapatan sudah menutup semua biaya — belum untung, tapi tidak lagi rugi. Semua penjualan setelah titik ini adalah laba murni.',
    },
    {
      type: 'concept',
      prompt:
        'Rumus titik impas: Unit impas = Biaya tetap ÷ Kontribusi per unit. Angka ini menunjukkan berapa produk yang harus terjual agar biaya tertutup.',
      explain:
        'Contoh: biaya tetap 10 juta, kontribusi per unit 50 ribu. Unit impas = 10.000.000 ÷ 50.000 = 200 unit. Di bawah 200 unit berarti rugi.',
    },
    {
      type: 'numeric',
      prompt:
        'Biaya tetap bulanan 12 juta dan kontribusi per unit 60 ribu. Berapa unit yang harus terjual untuk mencapai titik impas?',
      unit: 'unit',
      acceptRange: [190, 210],
      explain:
        '12.000.000 ÷ 60.000 = 200 unit. Kalau penjualan bulanan konsisten di atas 200, bisnis mulai menghasilkan laba.',
    },
    {
      type: 'choice',
      prompt:
        'Kontribusi per unit naik (harga naik atau biaya turun). Apa yang terjadi pada jumlah unit impas?',
      options: [
        { id: 'a', label: 'Unit impas turun' },
        { id: 'b', label: 'Unit impas naik' },
        { id: 'c', label: 'Unit impas tidak berubah' },
        { id: 'd', label: 'Biaya tetap ikut naik' },
      ],
      correctId: 'a',
      explain:
        'Kontribusi ada di penyebut. Semakin besar kontribusi per unit, semakin sedikit unit yang dibutuhkan untuk menutup biaya tetap.',
    },
    {
      type: 'numeric',
      prompt:
        'Harga jual 100 ribu, biaya variabel per unit 40 ribu, dan biaya tetap 6 juta. Berapa unit impasnya?',
      unit: 'unit',
      acceptRange: [95, 105],
      explain:
        'Kontribusi = 100 − 40 = 60 ribu. Unit impas = 6.000.000 ÷ 60.000 = 100 unit.',
    },
    {
      type: 'allocation',
      prompt:
        'Untuk menurunkan titik impas, alokasikan 100% strategi kamu ke tiga langkah: menaikkan harga, menurunkan biaya tetap, dan menurunkan biaya variabel — dengan syarat menurunkan biaya tetap minimal 30%.',
      categories: ['Naikkan harga', 'Turunkan biaya tetap', 'Turunkan biaya variabel'],
      rule: { category: 'Turunkan biaya tetap', min: 30 },
      explain:
        'Biaya tetap adalah beban yang harus dibayar meski tidak ada penjualan. Menguranginya langsung menurunkan unit impas dan membuat bisnis lebih tahan banting.',
    },
  ],
}
