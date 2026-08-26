// Accounting lesson 4: cash flow vs profit.
import type { Lesson } from "#/engine/types.ts";

export const arusKasLesson: Lesson = {
  id: "arus-kas",
  title: "Arus kas: uang yang benar-benar masuk dan keluar",
  screens: [
    {
      type: "choice",
      prompt:
        "Usaha kamu untung besar di laporan, tapi uang di rekening terus menipis. Apa penyebab paling umum?",
      options: [
        { id: "a", label: "Penjualan kredit belum dibayar pelanggan" },
        { id: "b", label: "Pendapatan terlalu tinggi" },
        { id: "c", label: "Beban terlalu rendah" },
        { id: "d", label: "Laba ditahan terlalu banyak" },
      ],
      correctId: "a",
      explain:
        "Laba dicatat saat penjualan terjadi, tapi kas baru masuk saat pelanggan membayar. Banyak usaha sehat secara laba tapi bangkrut karena kekurangan kas.",
    },
    {
      type: "concept",
      prompt:
        "Laba dan kas itu beda. Laba adalah hasil kalkulasi; kas adalah uang nyata di rekening. Laporan arus kas mencatat uang yang benar-benar masuk dan keluar.",
      explain:
        "Penjualan kredit menaikkan laba hari ini tapi belum menaikkan kas. Sebaliknya, pembelian mesin tunai menurunkan kas tanpa menurunkan laba sekaligus.",
    },
    {
      type: "numeric",
      prompt:
        "Kas awal bulan 10 juta. Penerimaan kas 25 juta dan pengeluaran kas 18 juta. Berapa kas akhir bulan?",
      unit: "juta",
      acceptRange: [16, 18],
      explain:
        "Kas akhir = 10 + 25 − 18 = 17 juta. Menghitung arus kas bulanan mencegah kejutan kehabisan uang di tengah jalan.",
    },
    {
      type: "choice",
      prompt:
        "Kamu membeli mesin espresso baru 30 juta tunai. Dalam laporan arus kas, pembelian ini termasuk kategori apa?",
      options: [
        { id: "a", label: "Arus kas investasi" },
        { id: "b", label: "Beban operasional" },
        { id: "c", label: "Pendapatan" },
        { id: "d", label: "Ekuitas" },
      ],
      correctId: "a",
      explain:
        "Pembelian aset jangka panjang seperti mesin masuk arus kas investasi. Arus kas operasional hanya untuk aktivitas sehari-hari seperti jualan dan gaji.",
    },
    {
      type: "numeric",
      prompt:
        "Total piutang 30 juta dan pelanggan baru membayar 12 juta. Berapa sisa piutang yang belum tertagih?",
      unit: "juta",
      acceptRange: [17, 19],
      explain:
        "Sisa piutang = 30 − 12 = 18 juta. Piutang besar itu kas yang belum masuk — semakin cepat tertagih, semakin sehat arus kas kamu.",
    },
    {
      type: "allocation",
      prompt:
        "Alokasikan kas bulanan kamu ke tiga pos: operasional, tabungan darurat, dan pengembangan usaha — dengan syarat tabungan darurat minimal 15%.",
      categories: ["Operasional", "Tabungan darurat", "Pengembangan usaha"],
      rule: { category: "Tabungan darurat", min: 15 },
      explain:
        "Tabungan darurat 15% atau lebih menjaga usaha tetap jalan saat penjualan lesu atau ada keperluan mendadak. Kas darurat adalah penjaga arus kas.",
    },
  ],
};
