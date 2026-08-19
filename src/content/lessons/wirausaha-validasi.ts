// Entrepreneurship lesson 4: validating an idea before building.
import type { Lesson } from '#/engine/types.ts'

export const wirausahaValidasiLesson: Lesson = {
  id: 'wirausaha-validasi-1',
  title: 'Validasi ide sebelum mengeluarkan uang',
  screens: [
    {
      type: 'choice',
      prompt:
        'Kamu punya ide usaha yang terasa brilian. Langkah paling murah untuk mengujinya sebelum membangun?',
      options: [
        { id: 'a', label: 'Wawancara dan menawarkan pre-order ke calon pelanggan' },
        { id: 'b', label: 'Langsung membangun produk lengkap' },
        { id: 'c', label: 'Meminjam uang untuk sewa tempat' },
        { id: 'd', label: 'Menunggu ide "sempurna" dulu' },
      ],
      correctId: 'a',
      explain:
        'Wawancara dan pre-order memberi bukti permintaan sebelum modal besar keluar. Kalau calon pelanggan bersedia memesan di muka, permintaannya nyata.',
    },
    {
      type: 'concept',
      prompt:
        'Validasi adalah mencari tahu apakah orang benar-benar mau membayar, bukan hanya bilang "ide bagus". Alat termurah: wawancara, landing page, dan pre-order.',
      explain:
        'Pujian itu gratis dan tidak mengikat. Uang di muka adalah bukti paling jujur bahwa masalahnya nyata dan solusimu dihargai.',
    },
    {
      type: 'numeric',
      prompt:
        'Dari 20 orang yang diwawancarai, 12 bersedia membayar di muka untuk produkmu. Berapa persen yang memberi sinyal permintaan?',
      unit: 'persen',
      acceptRange: [58, 62],
      explain:
        '12 ÷ 20 × 100% = 60%. Enam dari sepuluh bersedia mengeluarkan uang — sinyal jauh lebih kuat daripada sekadar "tertarik".',
    },
    {
      type: 'choice',
      prompt:
        'Mana bukti terkuat bahwa sebuah ide layak dikejar?',
      options: [
        { id: 'a', label: 'Orang sudah membayar pre-order' },
        { id: 'b', label: 'Teman-teman bilang idenya bagus' },
        { id: 'c', label: 'Ide ini sedang tren di media sosial' },
        { id: 'd', label: 'Kamu sendiri sangat yakin' },
      ],
      correctId: 'a',
      explain:
        'Uang di muka adalah sinyal paling kuat. Pujian dan tren tidak menjamin orang akan mengeluarkan uang ketika waktunya tiba.',
    },
    {
      type: 'numeric',
      prompt:
        'Harga pre-order 50 ribu dan 30 orang memesan di muka. Berapa total uang yang berhasil dikumpulkan?',
      unit: 'juta',
      acceptRange: [1.4, 1.6],
      explain:
        '30 × 50.000 = 1,5 juta. Uang di muka ini membuktikan permintaan sekaligus mendanai tahap awal pengembangan.',
    },
    {
      type: 'allocation',
      prompt:
        'Alokasikan 100% anggaran validasi ke riset pasar, prototipe, dan iklan kecil — dengan syarat riset pasar minimal 30%.',
      categories: ['Riset pasar', 'Prototipe', 'Iklan kecil'],
      rule: { category: 'Riset pasar', min: 30 },
      explain:
        'Riset pasar yang cukup memastikan kamu memahami masalah sebelum memproduksi. Iklan kecil menguji permintaan dengan uang yang terkendali.',
    },
  ],
}
