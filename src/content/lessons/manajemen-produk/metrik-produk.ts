// Product Management lesson 3: north-star metrics, activation and retention.
import type { Lesson } from '#/engine/types.ts'

export const metrikProdukLesson: Lesson = {
  id: 'metrik-produk',
  title: 'Metrik yang benar: aktivasi dan retensi',
  screens: [
    {
      type: 'choice',
      prompt:
        'Aplikasi kamu diunduh 1.000 kali, tapi hanya 20 orang yang aktif minggu ini. Metrik mana yang paling penting untuk diperbaiki?',
      options: [
        { id: 'a', label: 'Pengguna aktif' },
        { id: 'b', label: 'Jumlah unduhan' },
        { id: 'c', label: 'Rating di toko aplikasi' },
        { id: 'd', label: 'Jumlah fitur yang dimiliki' },
      ],
      correctId: 'a',
      explain:
        'Unduhan adalah metrik kesombongan (vanity metric). Yang menentukan keberhasilan adalah berapa banyak orang yang benar-benar memakai dan kembali menggunakan produk.',
    },
    {
      type: 'concept',
      prompt:
        'Aktivasi adalah momen pengguna merasakan nilai pertama kali. Retensi adalah seberapa banyak pengguna yang kembali. Keduanya lebih penting daripada sekadar unduhan atau klik.',
      explain:
        'Satu metrik inti (north-star metric) seperti "jumlah sesi belajar selesai" menyatukan seluruh tim: engineering, desain, dan marketing bergerak ke arah angka yang sama.',
    },
    {
      type: 'numeric',
      prompt:
        '1.000 orang mendaftar dan 300 di antaranya aktif minggu ini. Berapa persen aktivasi penggunanya?',
      unit: 'persen',
      acceptRange: [28, 32],
      explain:
        'Aktivasi = 300 ÷ 1.000 × 100% = 30%. Aktivasi yang rendah biasanya karena pengguna tidak menemukan nilai produk di kunjungan pertama.',
    },
    {
      type: 'choice',
      prompt:
        'Retensi 50% pada minggu kedua berarti …',
      options: [
        { id: 'a', label: 'Setengah pengguna kembali menggunakan produk' },
        { id: 'b', label: 'Setengah fitur dipakai pengguna' },
        { id: 'c', label: 'Setengah unduhan berasal dari iklan' },
        { id: 'd', label: 'Setengah pengguna membayar' },
      ],
      correctId: 'a',
      explain:
        'Retensi mengukur pengguna yang kembali. Kalau pengguna datang sekali lalu tidak pernah lagi, produk belum berhasil menciptakan kebiasaan.',
    },
    {
      type: 'numeric',
      prompt:
        '200 pengguna aktif di minggu pertama, lalu 150 di antaranya kembali di minggu kedua. Berapa persen retensi minggu keduanya?',
      unit: 'persen',
      acceptRange: [73, 77],
      explain:
        'Retensi = 150 ÷ 200 × 100% = 75%. Tiga perempat pengguna kembali — angka retensi yang sehat.',
    },
    {
      type: 'allocation',
      prompt:
        'Alokasikan 100% fokus tim ke tiga metrik: aktivasi, retensi, dan revenue — dengan syarat retensi minimal 40%.',
      categories: ['Aktivasi', 'Retensi', 'Revenue'],
      rule: { category: 'Retensi', min: 40 },
      explain:
        'Menarik pengguna baru (akuisisi) itu mahal. Menaikkan retensi sering kali efeknya lebih besar pada pertumbuhan daripada menambah anggaran iklan.',
    },
  ],
}
