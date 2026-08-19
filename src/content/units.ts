// Content units: ordered list of units and their lessons for the learning path.
import type { Unit } from '#/engine/types.ts'
import { whySaveEarlyLesson } from './lessons/why-save-early.ts'
import { nilaiWaktuUangLesson } from './lessons/nilai-waktu-uang.ts'
import { anggaranBulananLesson } from './lessons/anggaran-bulanan.ts'
import { hutangCicilanLesson } from './lessons/hutang-cicilan.ts'
import { akuntansiPersamaanLesson } from './lessons/akuntansi-persamaan.ts'
import { akuntansiTransaksiLesson } from './lessons/akuntansi-transaksi.ts'
import { akuntansiLabaRugiLesson } from './lessons/akuntansi-laba-rugi.ts'
import { akuntansiArusKasLesson } from './lessons/akuntansi-arus-kas.ts'
import { produkMasalahLesson } from './lessons/produk-masalah.ts'
import { produkPrioritasLesson } from './lessons/produk-prioritas.ts'
import { produkMetrikLesson } from './lessons/produk-metrik.ts'
import { produkMvpLesson } from './lessons/produk-mvp.ts'
import { wirausahaUnitEkonomiLesson } from './lessons/wirausaha-unit-ekonomi.ts'
import { wirausahaBreakEvenLesson } from './lessons/wirausaha-break-even.ts'
import { wirausahaHargaLesson } from './lessons/wirausaha-harga.ts'
import { wirausahaValidasiLesson } from './lessons/wirausaha-validasi.ts'

export const units = [
  {
    id: 'keuangan',
    title: 'Keuangan',
    lessons: [
      whySaveEarlyLesson,
      nilaiWaktuUangLesson,
      anggaranBulananLesson,
      hutangCicilanLesson,
    ],
  },
  {
    id: 'akuntansi',
    title: 'Akuntansi',
    lessons: [
      akuntansiPersamaanLesson,
      akuntansiTransaksiLesson,
      akuntansiLabaRugiLesson,
      akuntansiArusKasLesson,
    ],
  },
  {
    id: 'manajemen-produk',
    title: 'Manajemen Produk',
    lessons: [
      produkMasalahLesson,
      produkPrioritasLesson,
      produkMetrikLesson,
      produkMvpLesson,
    ],
  },
  {
    id: 'kewirausahaan',
    title: 'Kewirausahaan',
    lessons: [
      wirausahaUnitEkonomiLesson,
      wirausahaBreakEvenLesson,
      wirausahaHargaLesson,
      wirausahaValidasiLesson,
    ],
  },
] satisfies readonly Unit[]