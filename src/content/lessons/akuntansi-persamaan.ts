// Accounting lesson 1: the fundamental equation Aset = Liabilitas + Ekuitas.
import type { Lesson } from '#/engine/types.ts'

export const akuntansiPersamaanLesson: Lesson = {
  id: 'akuntansi-persamaan-1',
  title: 'Persamaan dasar: aset, utang, dan modal',
  screens: [
    {
      type: 'choice',
      prompt:
        'Warung kamu punya persediaan 10 juta, kas di laci 5 juta, dan mesin kopi 15 juta. Dalam akuntansi, ketiga hal ini disebut apa?',
      options: [
        { id: 'a', label: 'Aset' },
        { id: 'b', label: 'Hutang' },
        { id: 'c', label: 'Modal' },
        { id: 'd', label: 'Beban' },
      ],
      correctId: 'a',
      explain:
        'Semua barang bernilai yang dimiliki usaha — kas, persediaan, mesin — disebut aset. Aset adalah hal yang bisa mengalirkan manfaat di masa depan.',
    },
    {
      type: 'concept',
      prompt:
        'Semua akuntansi berakar di satu persamaan: Aset = Liabilitas + Ekuitas. Aset adalah yang kamu punya. Liabilitas adalah yang kamu pinjam. Ekuitas adalah bagian pemilik.',
      explain:
        'Aset di kiri selalu sama dengan jumlah utang (liabilitas) dan modal pemilik (ekuitas) di kanan. Kalau tidak seimbang, ada yang salah dalam catatan.',
    },
    {
      type: 'numeric',
      prompt:
        'Total aset warung kamu 150 juta dan total liabilitas (hutang) 90 juta. Berapa ekuitas atau modal pemiliknya?',
      unit: 'juta',
      acceptRange: [58, 62],
      explain:
        'Ekuitas = Aset − Liabilitas = 150 − 90 = 60 juta. Inilah bagian yang benar-benar milik pemilik setelah semua hutang dikurangkan.',
    },
    {
      type: 'choice',
      prompt:
        'Kamu membeli mesin kopi baru 20 juta secara kredit. Aset bertambah 20 juta. Sisi mana di persamaan yang ikut bertambah?',
      options: [
        { id: 'a', label: 'Liabilitas, karena ada utang baru' },
        { id: 'b', label: 'Ekuitas, karena pemilik jadi kaya' },
        { id: 'c', label: 'Tidak ada, asetnya hilang' },
        { id: 'd', label: 'Beban, karena uang terpakai' },
      ],
      correctId: 'a',
      explain:
        'Beli secara kredit artinya timbul utang. Aset naik 20 juta, liabilitas naik 20 juta — persamaan tetap seimbang dan ekuitas tidak berubah.',
    },
    {
      type: 'numeric',
      prompt:
        'Total aset 200 juta dan ekuitas 80 juta. Berapa total liabilitas (hutang) usaha ini?',
      unit: 'juta',
      acceptRange: [118, 122],
      explain:
        'Liabilitas = Aset − Ekuitas = 200 − 80 = 120 juta. Semakin besar liabilitas dibanding aset, semakin besar risiko usahanya.',
    },
    {
      type: 'allocation',
      prompt:
        'Bisnis kopi kamu dibiayai dua sumber: modal sendiri dan hutang. Bagi struktur modal total 100% dengan syarat hutang maksimal 40%.',
      categories: ['Modal sendiri', 'Hutang'],
      rule: { category: 'Hutang', max: 40 },
      explain:
        'Pemberi pinjaman lebih percaya kalau bagian hutang tidak dominan. Hutang maksimal 40% dari total pendanaan menjaga persamaan tetap sehat.',
    },
  ],
}
