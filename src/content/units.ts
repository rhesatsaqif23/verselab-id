// Content units: ordered list of units and their lessons for the learning path.
import type { Unit } from "#/engine/types.ts";
import { nabungAwalLesson } from "./lessons/keuangan/nabung-awal.ts";
import { nilaiWaktuUangLesson } from "./lessons/keuangan/nilai-waktu-uang.ts";
import { anggaranBulananLesson } from "./lessons/keuangan/anggaran-bulanan.ts";
import { hutangCicilanLesson } from "./lessons/keuangan/hutang-cicilan.ts";
import { persamaanLesson } from "./lessons/akuntansi/persamaan.ts";
import { transaksiLesson } from "./lessons/akuntansi/transaksi.ts";
import { labaRugiLesson } from "./lessons/akuntansi/laba-rugi.ts";
import { arusKasLesson } from "./lessons/akuntansi/arus-kas.ts";
import { menemukanMasalahLesson } from "./lessons/manajemen-produk/menemukan-masalah.ts";
import { prioritasFiturLesson } from "./lessons/manajemen-produk/prioritas-fitur.ts";
import { metrikProdukLesson } from "./lessons/manajemen-produk/metrik-produk.ts";
import { mvpValidasiLesson } from "./lessons/manajemen-produk/mvp-validasi.ts";
import { unitEkonomiLesson } from "./lessons/kewirausahaan/unit-ekonomi.ts";
import { titikImpasLesson } from "./lessons/kewirausahaan/titik-impas.ts";
import { menentukanHargaLesson } from "./lessons/kewirausahaan/menentukan-harga.ts";
import { validasiIdeLesson } from "./lessons/kewirausahaan/validasi-ide.ts";

export const units = [
  {
    id: "keuangan",
    title: "Keuangan",
    imageUrl: "/unit/keuangan.webp",
    lessons: [nabungAwalLesson, nilaiWaktuUangLesson, anggaranBulananLesson, hutangCicilanLesson],
  },
  {
    id: "akuntansi",
    title: "Akuntansi",
    imageUrl: "/unit/akuntansi.webp",
    lessons: [persamaanLesson, transaksiLesson, labaRugiLesson, arusKasLesson],
  },
  {
    id: "manajemen-produk",
    title: "Manajemen Produk",
    imageUrl: "/unit/manajemen-produk.webp",
    lessons: [menemukanMasalahLesson, prioritasFiturLesson, metrikProdukLesson, mvpValidasiLesson],
  },
  {
    id: "kewirausahaan",
    title: "Kewirausahaan",
    imageUrl: "/unit/kewirausahaan.webp",
    lessons: [unitEkonomiLesson, titikImpasLesson, menentukanHargaLesson, validasiIdeLesson],
  },
] satisfies readonly Unit[];
