// Product Management lesson 1: start from the customer problem, not the solution.
import type { Lesson } from "#/engine/types.ts";

export const menemukanMasalahLesson: Lesson = {
  id: "menemukan-masalah",
  title: "Mulai dari masalah, bukan dari fitur",
  icon: "Search",
  screens: [
    {
      type: "choice",
      prompt: 'Orang sebenarnya tidak "membeli produk". Mereka membeli sesuatu untuk …',
      options: [
        { id: "a", label: "Menyelesaikan pekerjaan atau masalah tertentu" },
        { id: "b", label: "Mengoleksi fitur sebanyak mungkin" },
        { id: "c", label: "Membuat aplikasinya terlihat keren" },
        { id: "d", label: "Menebak fitur apa yang akan datang" },
      ],
      correctId: "a",
      explain:
        'Konsep jobs-to-be-done: orang "menyewa" produk untuk menyelesaikan pekerjaan. Kalau kamu paham masalahnya, fitur yang tepat akan terlihat dengan sendirinya.',
    },
    {
      type: "concept",
      prompt:
        "Banyak produk gagal bukan karena kualitasnya buruk, tapi karena memecahkan masalah yang tidak penting. Riset dimulai dari wawancara dan observasi pengguna, bukan dari mendesain layar.",
      explain:
        "Sebelum menulis fitur apa pun, tanyakan: masalah apa yang benar-benar dialami orang ini? Seberapa sering? Seberapa menyakitkan? Jawabannya menentukan apa yang layak dibangun.",
    },
    {
      type: "numeric",
      prompt:
        "Kamu mewawancarai 40 calon pengguna dan 24 di antaranya mengalami masalah yang sama. Berapa persen yang mengalami masalah itu?",
      unit: "persen",
      acceptRange: [58, 62],
      explain:
        "24 ÷ 40 × 100% = 60%. Enam dari sepuluh orang mengalami masalah yang sama — sinyal kuat bahwa ini bukan masalah satu-dua orang saja.",
    },
    {
      type: "choice",
      prompt: "Mana tanda paling kuat bahwa sebuah masalah layak diselesaikan?",
      options: [
        { id: "a", label: "Orang sudah membayar solusi lain (manual atau produk pesaing)" },
        { id: "b", label: "Ide solusinya terdengar canggih" },
        { id: "c", label: "Banyak fitur yang bisa ditambahkan" },
        { id: "d", label: "Tim developer sangat bersemangat" },
      ],
      correctId: "a",
      explain:
        "Kalau orang sudah mengeluarkan uang untuk menyelesaikan masalah ini, artinya ada permintaan nyata. Solusi manual yang merepotkan adalah peluang terbaik.",
    },
    {
      type: "numeric",
      prompt:
        "Kamu mewawancarai 5 orang per minggu. Dalam 3 minggu, berapa total orang yang berhasil kamu wawancarai?",
      unit: "orang",
      acceptRange: [15, 15],
      explain:
        "5 × 3 = 15 wawancara. Rangkaian wawancara kecil tapi rutin jauh lebih baik daripada satu riset besar yang hanya dilakukan sekali.",
    },
    {
      type: "allocation",
      prompt:
        "Alokasikan 100% waktu riset kamu ke tiga metode: wawancara, observasi lapangan, dan analisis data — dengan syarat wawancara minimal 40%.",
      categories: ["Wawancara", "Observasi", "Analisis data"],
      rule: { category: "Wawancara", min: 40 },
      explain:
        "Wawancara mengungkap alasan terdalam di balik perilaku, bukan hanya angka. Sebagian besar waktu riset sebaiknya dihabiskan mendengar langsung dari pengguna.",
    },
  ],
};
