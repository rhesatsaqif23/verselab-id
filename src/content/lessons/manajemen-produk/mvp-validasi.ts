// Product Management lesson 4: MVP and the build-measure-learn loop.
import type { Lesson } from '#/engine/types.ts'

export const mvpValidasiLesson: Lesson = {
  id: 'mvp-validasi',
  title: 'MVP: menguji asumsi dengan usaha terkecil',
  screens: [
    {
      type: 'choice',
      prompt:
        'Apa tujuan utama sebuah MVP (minimum viable product)?',
      options: [
        { id: 'a', label: 'Menguji asumsi terbesar dengan usaha paling sedikit' },
        { id: 'b', label: 'Merilis produk dengan semua fitur lengkap' },
        { id: 'c', label: 'Membuat tampilan paling indah' },
        { id: 'd', label: 'Menghasilkan uang sebanyak-banyaknya' },
      ],
      correctId: 'a',
      explain:
        'MVP bukan versi produk yang jelek — ini versi paling kecil yang cukup untuk menguji hipotesis paling berisiko sebelum menginvestasikan sumber daya besar.',
    },
    {
      type: 'concept',
      prompt:
        'Siklus build-measure-learn: bangun versi kecil, ukur perilaku pengguna yang sesungguhnya, lalu belajar dan putuskan pivot atau lanjut. Kecepatan siklus ini adalah senjatamu.',
      explain:
        'MVP yang baik dirancang untuk memvalidasi asumsi, bukan untuk disempurnakan. Setiap siklus yang cepat membuat kamu belajar lebih banyak dengan uang yang lebih sedikit.',
    },
    {
      type: 'numeric',
      prompt:
        'Produk lengkap butuh 8 minggu untuk dibangun, sementara MVP cukup 2 minggu. Berapa minggu yang bisa kamu hemat dengan menguji MVP dulu?',
      unit: 'minggu',
      acceptRange: [5, 7],
      explain:
        '8 − 2 = 6 minggu. Enam minggu itu waktu untuk menguji asumsi sebelum semua sumber daya terpakai untuk membangun yang belum tentu dibutuhkan.',
    },
    {
      type: 'choice',
      prompt:
        'Setelah MVP diluncurkan, fokus utama kamu adalah …',
      options: [
        { id: 'a', label: 'Mengukur siapa yang memakai dan seberapa sering' },
        { id: 'b', label: 'Menambah fitur sebanyak mungkin' },
        { id: 'c', label: 'Menulis dokumentasi teknis' },
        { id: 'd', label: 'Merombak desain dari nol' },
      ],
      correctId: 'a',
      explain:
        'Data penggunaan nyata adalah hasil utama MVP. Tambahkan fitur hanya setelah kamu memahami apa yang dipakai dan mengapa.',
    },
    {
      type: 'numeric',
      prompt:
        'Dari 50 orang yang mencoba MVP, 10 memutuskan berlangganan. Berapa persen konversinya?',
      unit: 'persen',
      acceptRange: [18, 22],
      explain:
        'Konversi = 10 ÷ 50 × 100% = 20%. Satu dari lima mau membayar — cukup untuk melanjutkan sebelum membangun lebih banyak.',
    },
    {
      type: 'allocation',
      prompt:
        'Alokasikan 100% waktu siklus pengembangan ke build, measure, dan learn — dengan syarat measure minimal 20%.',
      categories: ['Build', 'Measure', 'Learn'],
      rule: { category: 'Measure', min: 20 },
      explain:
        'Membangun tanpa mengukur membuat kamu berjalan cepat ke arah yang salah. Sisihkan waktu khusus untuk mengukur dan memaknai hasil sebelum rilis berikutnya.',
    },
  ],
}
