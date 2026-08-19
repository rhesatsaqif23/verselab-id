// First lesson content: why saving early beats saving more, later.
import type { Lesson } from '#/engine/types.ts'

export const nabungAwalLesson: Lesson = {
  id: 'nabung-awal',
  title: 'Kenapa nabung lebih awal jauh lebih untung',
  screens: [
    {
      type: 'choice',
      prompt:
        'Si A nabung 1 juta per bulan selama 10 tahun mulai umur 25, terus berhenti total. Si B nabung 1 juta per bulan selama 15 tahun tapi baru mulai umur 35. Di umur 60, siapa yang duitnya lebih banyak?',
      options: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
        { id: 'c', label: 'Sama aja' },
      ],
      correctId: 'a',
      explain:
        'A cuma nyetor 120 juta, B nyetor 180 juta. Tapi duit A punya waktu 25 tahun buat berbunga, sementara B cuma 10 tahun.',
    },
    {
      type: 'concept',
      prompt:
        'Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.',
      explain:
        'Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya.',
    },
    {
      type: 'numeric',
      prompt:
        'Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Setelah 10 tahun, total tabungan kamu jadi berapa?',
      unit: 'juta',
      acceptRange: [80, 84],
      explain:
        'Setoran kamu totalnya cuma 60 juta, tapi jadi sekitar 82 juta. Selisih 22 juta itu dari bunga.',
    },
    {
      type: 'numeric',
      prompt: 'Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Tapi kamu baru mulai 5 tahun lebih telat. Setelah 10 tahun, total tabungan kamu jadi berapa?',
      unit: 'juta',
      acceptRange: [33, 36],
      explain:
        'Telat 5 tahun bikin hasilnya turun lebih dari setengah. Waktu itu bahan bakar utamanya.',
    },
    {
      type: 'allocation',
      prompt:
        'Gaji kamu 5 juta per bulan. Bagi ke tiga pos, dengan syarat tabungan minimal 20%.',
      categories: ['Kebutuhan', 'Keinginan', 'Tabungan'],
      rule: { category: 'Tabungan', min: 20 },
      explain:
        '20% dari 5 juta itu 1 juta per bulan. Dalam 10 tahun dengan bunga 6%, itu jadi sekitar 164 juta.',
    },
    {
      type: 'choice',
      prompt:
        'Kamu dapat bonus 10 juta. Mana yang paling berpengaruh ke kondisi keuangan kamu 10 tahun lagi?',
      options: [
        { id: 'a', label: 'Beli HP baru' },
        { id: 'b', label: 'Masukin ke tabungan jangka panjang' },
        { id: 'c', label: 'Bayar cicilan kartu kredit yang bunganya 30% per tahun' },
      ],
      correctId: 'c',
      explain:
        'Bunga utang 30% jauh lebih besar dari bunga tabungan 6%. Bayar utang mahal itu sama aja dapat untung 30%.',
    },
  ],
}
