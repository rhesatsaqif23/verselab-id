// Accounting lesson 2: recording transactions, debit and credit.
import type { Lesson } from '#/engine/types.ts'

export const akuntansiTransaksiLesson: Lesson = {
  id: 'akuntansi-transaksi-1',
  title: 'Mencatat transaksi: debit dan kredit',
  screens: [
    {
      type: 'choice',
      prompt:
        'Kamu membeli perlengkapan seharga 5 juta secara tunai. Kas berkurang 5 juta. Akun mana yang bertambah di sisi aset?',
      options: [
        { id: 'a', label: 'Perlengkapan' },
        { id: 'b', label: 'Beban sewa' },
        { id: 'c', label: 'Modal' },
        { id: 'd', label: 'Hutang' },
      ],
      correctId: 'a',
      explain:
        'Perlengkapan adalah aset baru senilai 5 juta. Kas turun 5 juta dan perlengkapan naik 5 juta — total aset tidak berubah, hanya bentuknya yang berubah.',
    },
    {
      type: 'concept',
      prompt:
        'Setiap transaksi dicatat dua sisi: debit di kiri dan kredit di kanan. Total debit harus selalu sama dengan total kredit. Inilah sistem pencatatan berpasangan (double-entry).',
      explain:
        'Membeli perlengkapan tunai: debit akun Perlengkapan 5 juta, kredit akun Kas 5 juta. Dua sisi, jumlah sama, dan persamaan aset = liabilitas + ekuitas tetap seimbang.',
    },
    {
      type: 'numeric',
      prompt:
        'Kamu menjual kopi 10 juta tunai, dan harga pokok kopi itu 6 juta. Berapa laba kotor dari penjualan ini?',
      unit: 'juta',
      acceptRange: [3, 5],
      explain:
        'Laba kotor = pendapatan − harga pokok = 10 − 6 = 4 juta. Laba kotor belum dikurangi beban operasional seperti gaji dan listrik.',
    },
    {
      type: 'choice',
      prompt:
        'Pelanggan melunasi hutangnya. Kas bertambah, dan akun yang berkurang adalah …',
      options: [
        { id: 'a', label: 'Piutang' },
        { id: 'b', label: 'Pendapatan' },
        { id: 'c', label: 'Modal' },
        { id: 'd', label: 'Persediaan' },
      ],
      correctId: 'a',
      explain:
        'Penjualan kredit tadi mencatat piutang. Saat dibayar, piutang berkurang dan kas bertambah. Pendapatan sudah diakui saat penjualan terjadi, bukan saat uang masuk.',
    },
    {
      type: 'numeric',
      prompt:
        'Sistem double-entry mewajibkan total debit sama dengan total kredit. Jika total debit hari ini 25 juta, berapa total kreditnya?',
      unit: 'juta',
      acceptRange: [24, 26],
      explain:
        'Total kredit harus persis sama dengan total debit, yaitu 25 juta. Kalau beda, itu tanda ada transaksi yang tercatat salah atau tidak lengkap.',
    },
    {
      type: 'numeric',
      prompt:
        'Kas di awal hari 10 juta. Hari ini kamu menerima pembayaran piutang 3 juta dan membayar sewa 2 juta. Berapa kas di akhir hari?',
      unit: 'juta',
      acceptRange: [10, 12],
      explain:
        'Kas akhir = 10 + 3 − 2 = 11 juta. Mencatat arus kas setiap hari membuat laporan keuangan bisa dipercaya.',
    },
  ],
}
