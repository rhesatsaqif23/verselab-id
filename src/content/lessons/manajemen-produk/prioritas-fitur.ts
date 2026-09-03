// Product Management lesson 2: prioritising features with impact and effort.
import type { Lesson } from "#/engine/types.ts";

export const prioritasFiturLesson: Lesson = {
  id: "prioritas-fitur",
  title: "Memilih Fitur yang Paling Penting Dulu",
  icon: "ListFilter",
  screens: [
    {
      type: "choice",
      prompt:
        "Fitur A berdampak besar tapi butuh waktu lama. Fitur B dampaknya kecil tapi cepat selesai. Mana yang harus dikerjakan lebih dulu?",
      options: [
        { id: "a", label: "Tergantung perbandingan dampak dan effort-nya" },
        { id: "b", label: "Selalu A karena dampaknya besar" },
        { id: "c", label: "Selalu B karena cepat selesai" },
        { id: "d", label: "Kedua-duanya dikerjakan sekaligus" },
      ],
      correctId: "a",
      explain:
        "Prioritas bukan soal satu variabel saja. Fitur besar yang berdampak besar dan fitur kecil yang cepat sama-sama punya tempat — keduanya harus diukur dengan skor yang sama.",
    },
    {
      type: "concept",
      prompt:
        "Skor prioritas sederhana: Skor = Dampak × Jangkauan ÷ Effort. Dampak seberapa besar pengaruhnya, Jangkauan berapa banyak pengguna terkena dampaknya, Effort berapa besar usaha pengerjaannya.",
      explain:
        "Semakin tinggi skor, semakin cepat dikerjakan. Framework ini memaksa kamu membandingkan fitur secara adil, bukan berdasarkan pendapat paling keras di ruangan.",
    },
    {
      type: "numeric",
      prompt:
        "Fitur login dengan Google: dampak 5, jangkauan 100 pengguna, effort 4. Berapa skor prioritasnya?",
      unit: "skor",
      acceptRange: [120, 130],
      explain:
        "Skor = 5 × 100 ÷ 4 = 125. Rumus ini menyeimbangkan nilai besar dan usaha pengerjaan dalam satu angka.",
    },
    {
      type: "choice",
      prompt:
        "Effort sebuah fitur naik (fitur jadi lebih sulit dikerjakan). Apa yang terjadi pada skor prioritasnya?",
      options: [
        { id: "a", label: "Skornya turun" },
        { id: "b", label: "Skornya naik" },
        { id: "c", label: "Skor tidak berubah" },
        { id: "d", label: "Dampaknya ikut naik" },
      ],
      correctId: "a",
      explain:
        "Effort ada di penyebut rumus. Semakin besar effort, semakin kecil skornya — fitur mahal butuh dampak besar untuk tetap layak dikerjakan.",
    },
    {
      type: "numeric",
      prompt:
        "Fitur pembayaran: dampak 4, jangkauan 200 pengguna, effort 5. Berapa skor prioritasnya?",
      unit: "skor",
      acceptRange: [155, 165],
      explain:
        "Skor = 4 × 200 ÷ 5 = 160. Jangkauan yang besar menutupi dampak per pengguna yang sedang.",
    },
    {
      type: "allocation",
      prompt:
        "Dalam satu sprint, alokasikan 100% kapasitas tim ke tiga jenis pekerjaan: fitur inti, perbaikan bug, dan eksperimen — dengan syarat fitur inti minimal 50%.",
      categories: ["Fitur inti", "Perbaikan bug", "Eksperimen"],
      rule: { category: "Fitur inti", min: 50 },
      explain:
        "Sebagian besar kapasitas harus ke arah yang menaikkan skor prioritas tertinggi. Bug dan eksperimen tetap dikerjakan, tapi tidak boleh mengalahkan fitur inti.",
    },
  ],
};
