# PRD: Aplikasi Belajar Interaktif

- **Versi:** 1.0
- **Tanggal:** 12 Agustus 2026
- **Status:** Draft, siap dikerjain
- **Nama produk:** belum final (sementara sebut aja "app")

---

## Cara baca dokumen ini

Dokumen ini dibaca dari atas ke bawah. Bagian 1 sampai 3 itu konteks, wajib dibaca sekali biar ngerti kita lagi bikin apa. Bagian 4 sampai 9 itu spesifikasi teknis, dibuka lagi tiap mau ngerjain task.

Kalau ada yang gak jelas atau kelihatan kontradiktif, tanya dulu, jangan ditebak. Salah tebak di awal biayanya mahal karena harus dibongkar.

---

## 1. Kita lagi bikin apa

### 1.1 Satu kalimat

Website buat belajar lewat soal interaktif pendek, mirip Brilliant.org atau Duolingo, dengan sistem XP dan streak biar orang balik lagi tiap hari.

### 1.2 Bedanya sama video course biasa

Di video course, kamu nonton orang ngejelasin, terus ngerasa paham, terus besoknya lupa.

Di sini, tiap layar kamu wajib ngelakuin sesuatu. Milih, geser slider, isi angka. Gak ada layar yang cuma bisa di-scroll lewat. Karena kamu harus mikir buat maju, materinya lebih nempel.

### 1.3 Materi pertamanya apa

Personal finance, level dasar banget. Contoh topik: kenapa nabung lebih awal jauh lebih untung, cara bagi gaji bulanan, kenapa cicilan kelihatan murah padahal enggak.

Kenapa materi ini yang dipilih: karena semua soalnya berupa angka, jadi ngecek jawabannya gampang (tinggal bandingin angka), dan nampilin hasilnya juga gampang (chart batang sederhana). Kita gak perlu bikin komponen ribet.

### 1.4 Tujuan sebenarnya dari project ini

Yang kita bikin sebenernya bukan aplikasi keuangan. Yang kita bikin itu mesin belajarnya. Materi keuangan cuma dipilih karena paling murah dikerjain. Kalau mesinnya udah kebukti jalan, kita bisa ganti materinya jadi apa aja tanpa nulis ulang mesinnya.

Ini penting banget dipahamin, karena banyak keputusan teknis di dokumen ini kelihatan aneh kalau kamu pikir kita lagi bikin aplikasi keuangan. Contohnya kenapa kode soal keuangan dipisah keras dari kode XP dan streak, padahal digabung lebih cepat selesai.

### 1.5 Buat siapa

Orang yang pengen ngerti dasar keuangan pribadi tapi males baca artikel panjang atau nonton video 40 menit. Umur 18 sampai 30, pengguna HP, waktu luangnya patah-patah (di angkot, nunggu antrian).

Konsekuensi ke desain: satu lesson harus selesai dalam 3 sampai 5 menit, dan harus bisa dikerjain sambil berdiri sebelah tangan.

---

## 2. Prinsip yang gak boleh dilanggar

Ini bukan saran, ini aturan. Kalau ada keputusan yang bentrok sama salah satu poin ini, poin ini yang menang.

1. **Gak ada layar pasif** — Tiap layar harus ada yang bisa diklik, digeser, atau diisi user. Kalau ada konsep yang gak bisa dibikin interaktif, pecah konsepnya atau buang. Pengecualian: maksimal satu layar penjelasan per lesson (lihat poin 2).

2. **Rasain dulu, istilahnya belakangan** — Urutan yang bener: user ngerjain soal yang bikin dia kaget atau penasaran, BARU dikasih tau nama konsepnya. Urutan yang salah: dikasih definisi dulu, baru disuruh ngerjain soal.
   - Contoh bener: "Si A nabung 10 tahun terus berhenti, si B nabung 15 tahun tapi mulainya telat. Siapa yang lebih banyak?" (user kaget jawabannya A) lalu layar berikutnya "Ini namanya bunga berbunga."
   - Contoh salah: "Bunga berbunga adalah bunga yang dihitung dari pokok plus bunga sebelumnya." lalu "Sekarang coba hitung."

3. **Salah itu bukan hukuman** — Waktu user salah, jangan cuma bilang salah. Langsung jelasin kenapa, dalam 2 kalimat. Jawaban yang bener juga tetap dikasih penjelasan singkat. Salah itu momen paling bagus buat ngajarin, jangan disia-siain.

4. **Satu layar satu ide** — Kalau satu layar ngajarin dua hal, pecah jadi dua layar.

5. **Salah tetap boleh lanjut** — Gak ada "ulangi dari awal". Gak ada nyawa yang habis. User yang salah tetap maju ke layar berikutnya, cuma nilai mastery-nya yang lebih rendah. Alasannya: aplikasi yang bikin user stuck itu ditinggal, bukan dikerjain lagi.

6. **Teks maksimal 2 kalimat per layar** — Kalau butuh lebih dari 2 kalimat buat jelasin, berarti idenya kegedean, pecah.

7. **Satu lesson selesai 3 sampai 5 menit** — Kalau lebih, jadiin dua lesson.

---

## 3. Struktur aplikasi

### 3.1 Susunan materi

- **Unit** — satu topik, contoh: "Bunga berbunga"
- **Lesson** — sekali duduk, 3 sampai 5 menit
- **Screen** — satu layar, satu soal
- Satu unit isinya 3 sampai 5 lesson
- Satu lesson isinya 6 sampai 8 screen
- Screen adalah unit terkecil, dan ini yang paling sering kamu kerjain

### 3.2 Pemisahan engine dan domain

Ini konsep paling penting di seluruh project. Baca pelan-pelan.

Kode dibagi dua bagian yang sengaja dipisah keras:

**Engine** — Bagian yang gak peduli materinya apa. Isinya:

- Cara nampilin lesson (progress bar, tombol, panel feedback)
- Ngitung dan nyimpen XP
- Ngitung streak harian
- Ngatur unit mana yang udah kebuka

Kalau besok materinya diganti dari keuangan jadi masak-memasak, folder ini gak disentuh sama sekali.

**Domain** — Bagian yang isinya materi. Sekarang isinya personal finance:

- Soal-soalnya
- Rumus hitungan keuangan
- Komponen chart buat nampilin angka

Kalau nanti mau nambah materi baru, bikin folder baru di sebelahnya. Engine gak diapa-apain.

#### Cara nentuin suatu kode masuk mana

Tanya satu pertanyaan: "kode ini nyebut-nyebut soal uang, bunga, gaji, atau cicilan gak?"

- Iya → masuk `domains/personal-finance/`
- Enggak → masuk `engine/`

Contoh:

- Fungsi ngitung bunga berbunga → domain (jelas soal uang)
- Komponen progress bar → engine (gak ada hubungannya sama uang)
- Fungsi nambah XP → engine
- Komponen slider bagi gaji → domain
- Fungsi nyimpen streak ke localStorage → engine

#### Aturan yang ngiket keduanya

- Engine ngasih data satu screen ke domain. Domain nampilin dan manggil balik fungsi `onAnswer(true)` atau `onAnswer(false)`.
- Engine gak pernah tau isi soalnya tentang apa. Dia cuma tau "user udah jawab, dan jawabannya bener atau salah".
- Kalau kamu nemu diri kamu nulis `if (materiNya === 'keuangan')` di dalam folder `engine/`, itu tandanya ada yang salah. Stop dan tanya.

### 3.3 Struktur folder

```
src/
├── engine/
│   ├── player/       Tampilan lesson: progress bar, tombol, panel feedback
│   ├── progress/     XP, streak, mastery, daily goal
│   ├── path/         Urutan unit dan aturan unlock
│   └── types.ts      Definisi tipe data Screen
├── domains/
│   └── personal-finance/
│       ├── math.ts       Semua rumus hitungan keuangan
│       ├── screens/      Komponen buat tiap tipe soal
│       └── components/   Chart dan komponen visual lain
├── content/              Data lesson dalam bentuk JSON
└── components/           Komponen umum (Button, dll)
```

---

## 4. Tipe screen

Ada 4 tipe screen di versi pertama. Tiap tipe punya komponen sendiri yang nampilin dia.

### 4.1 concept

- **Buat apa:** ngenalin nama sebuah konsep, setelah user ngerasain efeknya di layar sebelumnya.
- **Tampilannya:** teks penjelasan maksimal 2 kalimat, plus tombol "Lanjut". Gak ada yang perlu dijawab.
- **Aturan khusus:** maksimal SATU screen tipe ini per lesson. Kalau lebih, artinya kita kebanyakan ceramah.

Data yang dibutuhin:

```ts
{ type: 'concept', prompt: string, explain: string }
```

### 4.2 choice

- **Buat apa:** pilihan ganda. Dipakai buat bikin user penasaran di awal lesson, dan buat nerapin konsep ke situasi nyata di akhir lesson.
- **Tampilannya:** pertanyaan di atas, beberapa kartu opsi di bawahnya. Kartu yang dipilih dikasih border warna biru.
- **Aturan khusus:** maksimal 30% dari total screen dalam satu lesson. Kalau lebih dari itu, lesson-nya jadi kayak kuis biasa, bukan belajar interaktif.

Data yang dibutuhin:

```ts
{
  type: 'choice',
  prompt: string,
  options: { id: string, label: string }[],
  correctId: string,
  explain: string
}
```

### 4.3 numeric

- **Buat apa:** user ngitung sesuatu dan ngisi angkanya.
- **Tampilannya:** pertanyaan, input angka, satuan di sebelahnya (misal "juta rupiah").
- **Aturan penting:** jawabannya dicek pakai rentang, bukan angka persis.
  - Contoh: kalau jawaban benernya 77.641.000, terima aja jawaban antara 76 juta sampai 79 juta.
  - Kenapa begitu: yang mau kita ajarin itu ordo besarannya. Momen "oh ternyata setoran 60 juta bisa jadi hampir 78 juta" itu yang penting. Ketelitian sampai rupiah terakhir gak ada nilainya di sini, malah bikin user frustasi.
- **Aturan penting kedua:** angka jawaban yang bener dihitung pakai fungsi dari `math.ts`, jangan ditulis manual di data soal. Kalau ditulis manual, suatu saat rumusnya diperbaiki tapi angka di soal lupa diupdate, dan soalnya jadi salah tanpa ketauan.

Data yang dibutuhin:

```ts
{
  type: 'numeric',
  prompt: string,
  unit: string,
  acceptRange: [number, number],
  explain: string
}
```

### 4.4 allocation

- **Buat apa:** user bagi penghasilan bulanan ke beberapa pos.
- **Tampilannya:** tiga slider (kebutuhan, keinginan, tabungan). Total ketiganya selalu 100%, jadi kalau satu digeser naik, yang lain otomatis turun. Chart di atasnya update real time.
- **Cara ngecek jawaban:** berdasarkan aturan di data soal, misalnya "tabungan minimal 20%". Jadi banyak kombinasi yang bener, dan itu memang disengaja. Di dunia nyata emang gak ada satu jawaban tunggal buat cara bagi gaji.

Data yang dibutuhin:

```ts
{
  type: 'allocation',
  prompt: string,
  categories: string[],
  rule: { category: string, min?: number, max?: number },
  explain: string
}
```

---

## 5. Alur satu screen

Ini yang diulang terus di tiap layar. Hafalin alurnya.

1. Soal muncul. Prompt di atas, area interaksi di tengah, tombol "Check" di bawah (masih disabled karena user belum jawab).
2. User berinteraksi. Milih kartu, geser slider, atau ngetik angka. Begitu ada input, tombol "Check" jadi aktif.
3. User tekan "Check". Sistem ngecek jawaban.
4. Panel feedback naik dari bawah. Isinya: benar atau salah, plus penjelasan 2 kalimat. Warnanya hijau kalau bener, merah diredam kalau salah.
5. Tombol berubah jadi "Continue". Posisinya persis sama kayak tombol "Check" tadi.
6. User tekan "Continue". Lanjut ke screen berikutnya, balik ke langkah 1.

### Kenapa tombolnya harus di posisi yang sama

Ini kelihatan sepele tapi penting. User bakal ngulang alur ini 8 kali per lesson, ratusan kali per minggu. Kalau tombolnya loncat-loncat, tiap kali dia harus nyari tombolnya lagi pakai mata.

Kalau posisinya tetap, dia bisa klik berkali-kali tanpa mikir dan tanpa mindahin jempol. Ritmenya jadi enak, dan enak itu yang bikin orang balik lagi.

Jangan bikin panel feedback muncul sebagai popup atau modal. Popup nutupin soalnya, padahal user perlu lihat soalnya sambil baca penjelasan kenapa dia salah.

---

## 6. Sistem gamifikasi

### 6.1 XP

Pola yang cuma naik, gak pernah turun:

- Jawab satu screen bener: 10 XP
- Selesaiin satu lesson: bonus 50 XP

Fungsinya cuma satu: bikin user ngerasa maju terus. Makanya gak pernah turun.

### 6.2 Mastery

- Angka 0 sampai 100 per unit. Ini yang naik-turun.
- Naik kalau jawab bener
- Turun dikit kalau jawab salah
- Turun pelan sendiri kalau lama gak disentuh (misal 2 poin per minggu)

Fungsinya: jadi alasan buat user balik lagi ngulang materi lama. Ini sebenernya teknik belajar namanya spaced repetition, cuma dibungkus jadi kelihatan kayak game.

Angka pastinya (berapa naik, berapa turun) belum ditentuin. Pakai angka sementara dulu, nanti disesuaikan setelah dicoba.

### 6.3 Streak

- Jumlah hari berturut-turut user mencapai daily goal-nya.
- Daily goal dipilih sendiri sama user di awal: 3 menit, 10 menit, atau 20 menit per hari.
- **Streak freeze:** user dapat jatah 1 hari bolos gratis tiap 7 hari streak. Kalau dia bolos sehari dan punya jatah, streak-nya gak putus, jatahnya yang kepakai.
- Kenapa ada fitur ini: streak yang putus tanpa ampun bikin orang nyerah permanen. Mereka mikir "yaudah lah udah putus juga", terus gak balik lagi selamanya. Satu hari ampun bikin mereka balik.

### 6.4 Yang sengaja TIDAK dipakai

Kalau ada yang usul salah satu dari ini, jawabannya udah dipertimbangin dan ditolak:

- **Nyawa atau hearts (jatah salah terbatas)** — Bikin user takut salah. Padahal salah itu momen belajar paling bagus. Kalau user takut salah, dia bakal nebak-nebak aman, bukan mikir.
- **Timer per soal** — Materi ini soal mikir, bukan soal cepat-cepatan. Timer bikin panik dan bikin user asal klik.
- **Penalti XP kalau salah** — Cukup mastery yang turun. XP yang bisa turun bikin user ngerasa mundur, dan orang yang ngerasa mundur berhenti main.

---

## 7. Halaman yang perlu dibikin

Cuma 4 halaman di versi pertama.

### 7.1 Home

Halaman pertama yang dilihat user.

Isinya:

- Daftar unit, tiap unit ada indikator progress-nya
- Angka streak
- Daily goal hari ini udah tercapai atau belum
- Tombol besar buat lanjut ke lesson berikutnya

Bentuknya list biasa dulu. Ada rencana bikin versi yang lebih menarik nanti, tapi jangan dikerjain sekarang.

### 7.2 Lesson player

Tempat semua screen ditampilin. Alurnya udah dijelasin di bagian 5.

Bagian atas: progress bar (screen ke berapa dari total berapa) plus tombol keluar.

### 7.3 Lesson selesai

Muncul setelah screen terakhir.

Isinya:

- XP yang didapat
- Mastery unit naik dari berapa ke berapa
- Daftar soal yang tadi salah
- Tombol balik ke home

### 7.4 Profil (versi minimal)

- Total XP
- Streak sekarang
- Mastery tiap unit

---

## 8. Teknologi yang dipakai

### 8.1 Wajib dipakai sekarang

| Apa | Kenapa |
| --- | --- |
| React + TypeScript | TypeScript penting di sini karena tipe data Screen itu union type, dan TypeScript bakal otomatis ngasih tau field apa yang tersedia di tiap tipe |
| Vite | Build tool, udah keinstall |
| Tailwind v4 | CSS. Di v4 config warna ditulis di file CSS pakai `@theme`, bukan di `tailwind.config.js` kayak versi lama |
| Zustand | Nyimpen state (XP, streak, jawaban user). Lebih simpel dari Redux, cukup buat kebutuhan kita |
| localStorage | Nyimpen progress di browser user. Pakai middleware persist bawaan Zustand, jadi gak perlu nulis logic simpan-muat manual |
| TanStack Router | Routing antar halaman |
| Vitest | Testing, khusus buat fungsi hitungan di `math.ts` |

### 8.2 Belum dipakai, nanti aja

Jangan install ini dulu. Kalau merasa butuh salah satunya, tanya dulu.

| Nanti dipakai kalau | Apa |
| --- | --- |
| Halaman udah lebih dari 4 | TanStack Router |
| Udah mau bikin animasi transisi feedback | Motion (framer-motion) |
| Data lesson udah banyak dan perlu divalidasi | Zod |
| Chart-nya udah lebih rumit dari batang sederhana | Library chart |

### 8.3 Gak ada backend

Semua data disimpen di browser user pakai localStorage. Gak ada server, gak ada database, gak ada login.

Konsekuensinya: user yang ganti browser atau ganti HP kehilangan progress-nya. Itu diterima untuk sekarang.

Backend baru dibikin kalau nanti kita butuh sync antar device atau leaderboard.

---

## 9. Urutan ngerjain

Kerjain berurutan. Tiap nomor jadi fondasi nomor berikutnya.

Udah selesai: init project, komponen Button, warna biru branding.

1. Setup Tailwind v4 dan definisi warna
2. Bikin struktur folder engine dan domains
3. Bikin type definition Screen di `engine/types.ts`
4. Bikin fungsi hitungan keuangan di `math.ts` plus unit test-nya
5. Bikin renderer tipe choice
6. Bikin lesson player (progress bar, tombol, panel feedback)
7. Bikin renderer tipe concept
8. Bikin komponen BarChart sederhana
9. Bikin renderer tipe numeric
10. Bikin renderer tipe allocation
11. Bikin store buat sesi lesson (Zustand)
12. Bikin store buat progress plus simpen ke localStorage
13. Bikin halaman lesson selesai
14. Nulis materi lesson pertama
15. Bikin halaman home versi sederhana

### Kenapa fungsi hitungan (nomor 4) dikerjain duluan padahal belum ada UI

Semua pengecekan jawaban di aplikasi ini ujung-ujungnya manggil salah satu fungsi di `math.ts`. Kalau rumusnya salah, semua soal jadi salah.

Dan bug rumus itu susah ketauan kalau ketumpuk sama kode UI, karena kamu gak tau yang salah itu rumusnya atau cara nampilinnya.

Fungsi hitungan gampang banget dites karena gak ada UI-nya, tinggal kasih input dan cek output. Sekali fungsi ini bener dan ada test-nya, sisa pekerjaan tinggal manggil fungsinya. Kamu gak perlu mikirin rumus lagi pas lagi fokus ngerjain tampilan.

### Kenapa nulis materi (nomor 14) ditaruh belakangan

Karena tipe screen yang tersedia bakal ngebentuk gimana lesson-nya ditulis, bukan sebaliknya.

Kalau materinya ditulis duluan, kemungkinan besar ada soal yang butuh tipe screen yang belum ada, terus kita bikin komponen sekali pakai buat satu soal itu doang. Itu yang bikin project jadi berantakan.

---

## 10. Contoh lesson lengkap

Ini contoh isi lesson pertama, biar kebayang gimana semua bagian di atas nyatu. Judulnya "Kenapa nabung lebih awal jauh lebih untung".

**Screen 1, tipe `choice`**

- **Prompt:** "Si A nabung 1 juta per bulan selama 10 tahun mulai umur 25, terus berhenti total. Si B nabung 1 juta per bulan selama 15 tahun tapi baru mulai umur 35. Di umur 60, siapa yang duitnya lebih banyak?"
- **Opsi:** A / B / Sama aja
- **Jawaban benar:** A
- **Penjelasan:** "A cuma nyetor 120 juta, B nyetor 180 juta. Tapi duit A punya waktu 25 tahun buat berbunga, sementara B cuma 10 tahun."

**Screen 2, tipe `concept`**

- **Prompt:** "Yang bikin selisihnya besar tadi namanya bunga berbunga. Bunga tahun ini ikut kena bunga tahun depan, jadi makin lama makin cepat naiknya."
- Cuma tombol lanjut.

**Screen 3, tipe `numeric`**

- **Prompt:** "Kamu nabung 500 ribu per bulan dengan bunga 6% per tahun. Setelah 10 tahun, total tabungan kamu jadi berapa?"
- **Satuan:** juta rupiah
- **Rentang diterima:** 80 sampai 84
- **Penjelasan:** "Setoran kamu totalnya cuma 60 juta, tapi jadi sekitar 82 juta. Selisih 22 juta itu dari bunga."

**Screen 4, tipe `numeric`**

- **Prompt:** "Soal yang sama persis, tapi kamu baru mulai 5 tahun kemudian. Jadi berapa?"
- **Satuan:** juta rupiah
- **Rentang diterima:** 33 sampai 36
- **Penjelasan:** "Telat 5 tahun bikin hasilnya turun lebih dari setengah. Waktu itu bahan bakar utamanya."

**Screen 5, tipe `allocation`**

- **Prompt:** "Gaji kamu 5 juta per bulan. Bagi ke tiga pos, dengan syarat tabungan minimal 20%."
- **Kategori:** Kebutuhan, Keinginan, Tabungan
- **Aturan:** Tabungan minimal 20%
- **Penjelasan:** "20% dari 5 juta itu 1 juta per bulan. Dalam 10 tahun dengan bunga 6%, itu jadi sekitar 164 juta."

**Screen 6, tipe `choice`**

- **Prompt:** "Kamu dapat bonus 10 juta. Mana yang paling berpengaruh ke kondisi keuangan kamu 10 tahun lagi?"
- **Opsi:** Beli HP baru / Masukin ke tabungan jangka panjang / Bayar cicilan kartu kredit yang bunganya 30% per tahun
- **Jawaban benar:** Bayar cicilan kartu kredit
- **Penjelasan:** "Bunga utang 30% jauh lebih besar dari bunga tabungan 6%. Bayar utang mahal itu sama aja dapat untung 30%."

Perhatiin polanya: bikin penasaran (1), kasih nama (2), latihan (3, 4, 5), terapin ke situasi nyata (6).
