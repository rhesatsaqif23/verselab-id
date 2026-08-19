// Lesson: Anggaran Bulanan — building a simple monthly budget.
import type { Lesson } from '#/engine/types.ts'

export const anggaranBulananLesson: Lesson = {
  id: 'anggaran-bulanan',
  title: 'Membuat anggaran sederhana',
  screens: [
    {
      type: 'choice',
      prompt:
        'Gaji kamu Rp 7 juta per bulan. Setelah bayar sewa, makan, dan transport, sisa Rp 1 juta. Sisa ini sebaiknya?',
      options: [
        { id: 'a', label: 'Beli barang yang lagi diskon' },
        { id: 'b', label: 'Tabungan darurat dulu, sisanya baru investing' },
        { id: 'c', label: 'Terserah, yang penting senang' },
      ],
      correctId: 'b',
      explain:
        'Sebelum investasi, tabungan darurat harus terisi dulu. Minimal 3-6 bulan biaya hidup. Kalau ada kejadian mendadak, kamu gak perlu utang.',
    },
    {
      type: 'concept',
      prompt:
        'Aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan & investasi. Ini cara sederhana tapi efektif buat atur uang.',
      explain:
        'Anggaran gak harus rumit. Yang penting konsisten. Aturan 50/30/20 jadi framework dasar yang bisa disesuaikan.',
    },
    {
      type: 'numeric',
      prompt:
        'Gaji Rp 6 juta per bulan. Berdasarkan aturan 50/30/20, berapa maksimal untuk keinginan? (dalam juta)',
      unit: 'juta',
      acceptRange: [1.7, 1.9],
      explain:
        '30% dari Rp 6 juta = Rp 1.8 juta. Itu batas untuk keinginan (nongkrong, hiburan, jajan).',
    },
    {
      type: 'allocation',
      prompt:
        'Gaji kamu Rp 10 juta. Alokasikan ke empat pos ini. Tabungan & investasi harus minimal 20%.',
      categories: ['Kebutuhan', 'Keinginan', 'Tabungan', 'Investasi'],
      rule: { category: 'Tabungan', min: 20 },
      explain:
        'Tabungan dan investasi harus jadi prioritas, bukan sisa. Bayar diri sendiri dulu sebelum belanja.',
    },
    {
      type: 'choice',
      prompt:
        'Kamu punya cicilan Rp 1.5 juta per bulan dari gaji Rp 6 juta. Apakah aman?',
      options: [
        { id: 'a', label: 'Aman, masih 25% dari gaji' },
        { id: 'b', label: 'Mepet, idealnya di bawah 20%' },
        { id: 'c', label: 'Bahaya, karena 25% itu terlalu tinggi' },
      ],
      correctId: 'c',
      explain:
        'Banyak pakar keuangan menyarankan cicilan maksimal 30% dari gaji. Tapi untuk gaji Rp 6 juta, 25% sudah cukup mepet karena kebutuhan pokok juga besar.',
    },
    {
      type: 'numeric',
      prompt:
        'Pengeluaran bulanan kamu Rp 4.5 juta dari gaji Rp 6 juta. Berapa persen uang yang tersimpan? (dalam persen)',
      unit: 'persen',
      acceptRange: [24, 26],
      explain:
        '(6 - 4.5) / 6 × 100 = 25%. Itu sudah bagus! Lebih dari 20% yang disarankan.',
    },
  ],
}
