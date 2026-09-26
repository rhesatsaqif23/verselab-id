# Konsep Inti Verselab

## Arsitektur: Engine / Domain

Aplikasi ini dibagi dua bagian besar yang sengaja dipisah.

### Engine

Bagian yang gak peduli materinya apa. Dia cuma tau cara nampilin lesson, ngitung XP, nyimpen streak, dan nentuin unit mana yang kebuka. Kalau besok materinya diganti dari keuangan jadi masak-memasak, engine-nya gak disentuh sama sekali.

### Domain

Domain itu materinya. Sekarang isinya personal finance: soal-soalnya, rumus hitungannya, dan komponen khusus buat nampilin chart. Kalau nanti mau nambah materi baru, tinggal bikin folder baru di sebelahnya, engine-nya gak diapa-apain.

### Cara nentuin suatu kode masuk mana

- Kode menyebut uang, bunga, gaji, atau cicilan → `domains/personal-finance/`
- Kode tidak menyebut hal-hal di atas → `engine/`

Engine memberikan data satu screen ke domain. Domain menampilkan dan memanggil balik `onAnswer(true)` atau `onAnswer(false)`. Engine tidak pernah tahu isi soalnya — hanya tahu jawaban benar atau salah.

### Struktur folder

```
src/
├── engine/                  Tidak peduli materi apa
│   ├── player/              Tampilan lesson: progress bar, tombol, panel feedback
│   ├── progress/            XP, streak, mastery, daily goal
│   ├── path/                Urutan unit dan aturan unlock
│   └── types.ts             Definisi tipe data Screen
├── domains/
│   └── personal-finance/
│       ├── math.ts          Semua rumus hitungan keuangan
│       ├── screens/         Komponen buat tiap tipe soal
│       └── components/      Chart dan komponen visual lain
├── content/                 Data lesson dalam bentuk JSON
└── components/              Komponen umum (Button, dll)
```

---

## Istilah yang Kepakai di Task

### Screen

Satu layar berisi satu soal atau satu penjelasan. Ini unit terkecil.

### Lesson

Kumpulan 6 sampai 8 screen, selesai dalam 3 sampai 5 menit.

### Unit

Kumpulan lesson dengan satu topik, misal "bunga berbunga".

### Renderer

Komponen React yang menampilkan satu tipe screen. Tiap tipe soal punya renderer sendiri.

### Mastery

Angka 0 sampai 100 per unit, nunjukin seberapa menguasai. Bisa naik bisa turun.

### XP

Poin yang cuma naik, gak pernah turun. Buat rasa maju.
