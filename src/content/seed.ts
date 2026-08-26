import type { Lesson } from "#/engine/types.ts"
import { nabungAwalLesson } from "#/content/lessons/keuangan/nabung-awal.ts"
import { nilaiWaktuUangLesson } from "#/content/lessons/keuangan/nilai-waktu-uang.ts"
import { anggaranBulananLesson } from "#/content/lessons/keuangan/anggaran-bulanan.ts"
import { hutangCicilanLesson } from "#/content/lessons/keuangan/hutang-cicilan.ts"
import { persamaanLesson } from "#/content/lessons/akuntansi/persamaan.ts"
import { transaksiLesson } from "#/content/lessons/akuntansi/transaksi.ts"
import { labaRugiLesson } from "#/content/lessons/akuntansi/laba-rugi.ts"
import { arusKasLesson } from "#/content/lessons/akuntansi/arus-kas.ts"
import { menemukanMasalahLesson } from "#/content/lessons/manajemen-produk/menemukan-masalah.ts"
import { prioritasFiturLesson } from "#/content/lessons/manajemen-produk/prioritas-fitur.ts"
import { metrikProdukLesson } from "#/content/lessons/manajemen-produk/metrik-produk.ts"
import { mvpValidasiLesson } from "#/content/lessons/manajemen-produk/mvp-validasi.ts"
import { unitEkonomiLesson } from "#/content/lessons/kewirausahaan/unit-ekonomi.ts"
import { titikImpasLesson } from "#/content/lessons/kewirausahaan/titik-impas.ts"
import { menentukanHargaLesson } from "#/content/lessons/kewirausahaan/menentukan-harga.ts"
import { validasiIdeLesson } from "#/content/lessons/kewirausahaan/validasi-ide.ts"
import { useContentStore } from "#/content/contentStore.ts"

type UnitDef = {
  id: string
  title: string
  imageUrl: string
  lessonIds: string[]
}

const unitDefs: UnitDef[] = [
  { id: "keuangan", title: "Keuangan", imageUrl: "/unit/keuangan.webp", lessonIds: ["nabung-awal", "nilai-waktu-uang", "anggaran-bulanan", "hutang-cicilan"] },
  { id: "akuntansi", title: "Akuntansi", imageUrl: "/unit/akuntansi.webp", lessonIds: ["persamaan", "transaksi", "laba-rugi", "arus-kas"] },
  { id: "manajemen-produk", title: "Manajemen Produk", imageUrl: "/unit/manajemen-produk.webp", lessonIds: ["menemukan-masalah", "prioritas-fitur", "metrik-produk", "mvp-validasi"] },
  { id: "kewirausahaan", title: "Kewirausahaan", imageUrl: "/unit/kewirausahaan.webp", lessonIds: ["unit-ekonomi", "titik-impas", "menentukan-harga", "validasi-ide"] },
]

const allLessons: Lesson[] = [
  nabungAwalLesson, nilaiWaktuUangLesson, anggaranBulananLesson, hutangCicilanLesson,
  persamaanLesson, transaksiLesson, labaRugiLesson, arusKasLesson,
  menemukanMasalahLesson, prioritasFiturLesson, metrikProdukLesson, mvpValidasiLesson,
  unitEkonomiLesson, titikImpasLesson, menentukanHargaLesson, validasiIdeLesson,
]

export function seedContent() {
  const store = useContentStore

  // Seed units
  for (const def of unitDefs) {
    store.getState().addUnit({ id: def.id, title: def.title, imageUrl: def.imageUrl })
  }
  store.getState().reorderUnits(unitDefs.map((u) => u.id))

  // Seed lessons + screens
  for (const lesson of allLessons) {
    const unitDef = unitDefs.find((u) => u.lessonIds.includes(lesson.id))
    if (!unitDef) continue

    store.getState().addLesson(unitDef.id, { id: lesson.id, title: lesson.title })

    for (const screen of lesson.screens) {
      store.getState().addScreen(lesson.id, screen)
    }
  }

  store.setState({ seeded: true })
}