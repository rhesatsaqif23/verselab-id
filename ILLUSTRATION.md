# Panduan Produksi Ilustrasi Verselab

**Produk:** Verselab, aplikasi belajar interaktif
**Dokumen ini untuk:** Illustrator
**Isi:** Urutan kerja, daftar ilustrasi, dan aturan gaya
**Status:** Draft
**Tanggal:** 22 Agustus 2026
**Pemilik:** Ariverse Studio

---

## 1. Pembagian kerja

Semua urusan yang berhubungan dengan code ditangani developer. Illustrator tidak perlu menyentuh file kode, tidak perlu tahu SVG dibaca aplikasi seperti apa, dan tidak perlu mengurus dark mode secara teknis.

| Pekerjaan                                             | Siapa                                                    |
| ----------------------------------------------------- | -------------------------------------------------------- |
| Menyusun palet dan gaya                               | Ariverse Studio, sudah selesai. Ada di Lampiran A dan B. |
| Menggambar semua ilustrasi                            | Illustrator                                              |
| Menyiapkan file kerja, artboard, dan color style      | Illustrator, di Batch 0                                  |
| Ekspor SVG dan penamaan file                          | Illustrator, aturannya di Lampiran C                     |
| Mengubah SVG jadi kode yang bisa ganti warna otomatis | Developer                                                |
| Membuat dark mode berfungsi di aplikasi               | Developer                                                |
| Optimasi ukuran file dan pemasangan ke aplikasi       | Developer                                                |

---

## 2. Ringkasan urutan kerja

Total 39 ilustrasi dan 9 komponen, di luar track Soft Skill yang statusnya masih ditunda.

| Urutan | Batch   | Isi                           | Jumlah      | Perkiraan | Gate  |
| ------ | ------- | ----------------------------- | ----------- | --------- | ----- |
| 1      | Batch 0 | Menyiapkan file kerja         | 1 file      | 1 hari    | Ya    |
| 2      | Batch 1 | Kosakata bentuk               | 9 komponen  | 2 hari    | Ya    |
| 3      | Batch 2 | Track Keuangan Pribadi        | 9 ilustrasi | 4 hari    | Ya    |
| 4      | Batch 3 | Aset pendukung                | 6 ilustrasi | 1,5 hari  | Tidak |
| 5      | Batch 4 | Track Project Management      | 9 ilustrasi | 3 hari    | Tidak |
| 6      | Batch 5 | Track Data & Spreadsheet      | 8 ilustrasi | 3 hari    | Tidak |
| 7      | Batch 6 | Track Logika                  | 7 ilustrasi | 2,5 hari  | Tidak |
| 8      | Batch 7 | Track Soft Skill, kondisional | 6 ilustrasi | 2 hari    | Tidak |

---

## 3. Rincian per batch

### Batch 0. Menyiapkan file kerja

**Tujuan:** menyiapkan satu file kerja yang membuat semua ilustrasi berikutnya otomatis konsisten.

**Alat kerja:** Figma. Bukan karena lebih bagus dari Illustrator, tapi karena bentuk dasar di Batch 1 akan dipakai berulang sebagai component, dan Figma menangani itu paling rapi. Kalau lebih nyaman menggambar di Illustrator, boleh, tapi hasil akhirnya tetap dikumpulkan di satu file Figma.

**Yang dikerjakan:**

| No  | Yang dibuat        | Keterangan                                                                                                                                            |
| --- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0.1 | Artboard template  | Dua ukuran: 240 x 240 px untuk tile kursus, 480 x 360 px untuk hero track.                                                                            |
| 0.2 | Color style        | Semua warna di Lampiran A didaftarkan sebagai color style bernama. Setelah ini, warna hanya boleh diambil dari daftar, tidak boleh dari color picker. |
| 0.3 | Grid isometrik     | Layer bantu berisi grid isometrik, dipakai supaya semua objek duduk di sudut yang sama. Layer ini disembunyikan saat ekspor.                          |
| 0.4 | Artboard cek gelap | Satu artboard berlatar gelap untuk mengintip apakah ilustrasi masih terbaca. Bukan versi kedua, hanya alat cek.                                       |
| 0.5 | Pola halftone      | Pola titik yang dipakai untuk semua bidang bayangan. Dibuat sekali di sini, lalu dipakai ulang. Lihat Lampiran B.                                     |

**Definition of Done:**

- Satu bentuk uji sederhana digambar memakai artboard dan grid dari file ini.
- Warna bentuk uji diganti dengan menukar color style, bukan dengan mewarnai ulang manual.
- Bentuk uji dicek di artboard gelap dan masih terbaca.
- Pola halftone tampil rapi saat diperbesar dan diperkecil.

---

### Batch 1. Kosakata bentuk

**Tujuan:** membuat sembilan bentuk dasar yang akan dipakai berulang di seluruh ilustrasi.

Ini bukan ilustrasi jadi. Ini seperti membuat kuas: sekali dibuat, dipakai 39 kali. Dibuat sebagai component di Figma supaya kalau nanti ada yang diperbaiki, semua ilustrasi yang memakainya ikut berubah.

| No  | Nama   | Bentuk                          | Nanti dipakai untuk menggambar       |
| --- | ------ | ------------------------------- | ------------------------------------ |
| 1.1 | Block  | Balok isometrik                 | Satu unit apa pun: tugas, uang, data |
| 1.2 | Stack  | Balok bertumpuk                 | Penumpukan, pertumbuhan              |
| 1.3 | Vessel | Wadah terbuka dengan level isi  | Saldo, kapasitas, anggaran           |
| 1.4 | Flow   | Pita melengkung yang punya arah | Perpindahan, proses                  |
| 1.5 | Card   | Kartu tipis                     | Tugas, item, keputusan               |
| 1.6 | Grid   | Kisi kotak-kotak                | Tabel, matriks, kalender             |
| 1.7 | Scale  | Timbangan atau slider           | Pilihan yang saling berlawanan       |
| 1.8 | Node   | Bulatan dengan garis penghubung | Orang, urutan, hubungan              |
| 1.9 | Gate   | Bingkai yang dilewati sesuatu   | Saringan, syarat, keputusan          |

**Selesai kalau:**

- Kesembilan bentuk digambar pada sudut isometrik yang sama.
- Ketebalan garis luar seragam di kesembilannya.
- Kesembilannya dijejerkan dalam satu layar dan terlihat sebagai satu keluarga.
- Semuanya terdaftar sebagai component, bukan gambar lepas.

---

### Batch 2. Track Keuangan Pribadi

**Warna track:** petrol. **Tujuan:** menyelesaikan satu track penuh untuk menguji apakah sistemnya benar-benar jalan.

**Hero, ukuran 480 x 360** — `hero-keuangan`. Vessel besar dengan dua flow: satu masuk dari atas, satu keluar dari bawah, level isi di tengah. Ini gambaran tentang keuangan pribadi.

**Tile kursus, ukuran 240 x 240:**

| No  | Kursus                | Nama file       | Yang digambar                                          |
| --- | --------------------- | --------------- | ------------------------------------------------------ |
| 2.1 | Arus Kas Dasar        | `keu-cashflow`  | Dua vessel, flow masuk lebih besar dari flow keluar    |
| 2.2 | Anggaran & Prioritas  | `keu-budget`    | Satu vessel dibagi empat sekat dengan lebar berbeda    |
| 2.3 | Dana Darurat          | `keu-emergency` | Tiga block bertumpuk, tiap block satu bulan            |
| 2.4 | Utang & Bunga         | `keu-debt`      | Stack yang tiap lapisnya makin tebal ke atas           |
| 2.5 | Bunga Berbunga        | `keu-compound`  | Stack yang sama tapi tumbuh melengkung, bukan lurus    |
| 2.6 | Inflasi               | `keu-inflation` | Dua vessel identik, isi yang kanan lebih sedikit       |
| 2.7 | Menabung vs Investasi | `keu-invest`    | Dua stack sejajar, satu diam satu tumbuh               |
| 2.8 | Diversifikasi         | `keu-diversify` | Satu block besar dipecah jadi lima block warna berbeda |

Nomor 2.4 dan 2.5 sengaja mirip, yang berbeda cuma arah tumbuhnya. Itu memang isi pelajarannya: bunga bekerja ke dua arah. Jangan dibuat terlalu berbeda.

**Selesai kalau:**

- Sembilan gambar selesai dan sudah diekspor.
- Delapan tile dijejerkan di tampilan aplikasi yang sebenarnya, bukan di kanvas Figma.
- Dari jarak pandang normal, kedelapan tile terlihat sebagai satu keluarga.
- Tiap tile bisa dijelaskan dalam satu kalimat: gambar ini menunjukkan apa.
- Tidak ada tile yang memakai lebih dari satu warna track.

---

### Batch 3. Aset pendukung

Gambar di luar kursus. Semuanya netral, tidak memakai warna track mana pun.

| No  | Nama file          | Yang digambar                            | Muncul saat                            |
| --- | ------------------ | ---------------------------------------- | -------------------------------------- |
| 3.1 | `state-empty-plan` | Grid kosong dengan satu kotak menyala    | Pengguna belum punya materi apa pun    |
| 3.2 | `state-complete`   | Stack yang lengkap                       | Kursus selesai                         |
| 3.3 | `state-locked`     | Gate tertutup                            | Kursus belum terbuka                   |
| 3.4 | `state-error`      | Flow yang terputus di tengah             | Aplikasi gagal memuat                  |
| 3.5 | `streak-7`         | Tujuh block berjajar                     | Belajar tujuh hari berturut-turut      |
| 3.6 | `streak-30`        | Tiga puluh block tersusun jadi blok utuh | Belajar tiga puluh hari berturut-turut |

Nomor 3.5 dan 3.6 jangan digambar sebagai piala, medali, bintang, atau api. Bentuknya block yang menumpuk, karena itu yang benar-benar terjadi: pengguna mengumpulkan hari.

---

### Batch 4. Track Project Management

**Warna track:** indigo.

**Hero:** `hero-pm`. Tiga scale sejajar untuk cakupan, waktu, dan biaya. Satu digeser naik, dua lainnya otomatis turun.

| No  | Kursus                | Nama file        | Yang digambar                                                                                                                                                                                                                                                                                         |
| --- | --------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Segitiga Proyek       | `pm-triangle`    | Tiga scale saling terhubung                                                                                                                                                                                                                                                                           |
| 4.2 | Memecah Pekerjaan     | `pm-breakdown`   | Satu block besar pecah jadi sembilan block kecil                                                                                                                                                                                                                                                      |
| 4.3 | Urutan Ketergantungan | `pm-dependency`  | Rantai node, satu jalur ditebalkan                                                                                                                                                                                                                                                                    |
| 4.4 | Estimasi              | `pm-estimate`    | Block dengan bayangan memanjang, bukan tepi tegas                                                                                                                                                                                                                                                     |
| 4.5 | Prioritas             | `pm-priority`    | Grid 2×2 dengan garis silang tebal. Sumbu Dampak (vertikal) × Effort (horizontal). Lima sampai tujuh kartu kotak berukuran seragam tersebar di empat kuadran; posisi kartu yang bermakna, bukan ukurannya. Kuadran dampak-tinggi/effort-rendah diberi tint indigo lebih pekat sebagai fokus.          |
| 4.6 | Sprint & Backlog      | `pm-sprint`      | Antrean card masuk ke gate berukuran tetap                                                                                                                                                                                                                                                            |
| 4.7 | Risiko                | `pm-risk`        | Grid 4×4 dengan gridlines tipis. Sumbu Kemungkinan (horizontal) × Dampak (vertikal). Tiap risiko berupa node bulat di dalam sel; ukuran node bervariasi menandakan severity, membesar ke arah pojok kanan-atas. Latar gradasi indigo, terang di kiri-bawah (aman) makin pekat ke kanan-atas (bahaya). |
| 4.8 | Pemangku Kepentingan  | `pm-stakeholder` | Node di lingkaran konsentris, jarak berbeda                                                                                                                                                                                                                                                           |

---

## Lampiran A. Color Palet

### Netral, dipakai di semua track

| Nama style | Terang    | Gelap     | Dipakai untuk          |
| ---------- | --------- | --------- | ---------------------- |
| ink        | `#141B2D` | `#EDEFF4` | Garis luar dan teks    |
| paper      | `#F6F7F9` | `#141B2D` | Latar                  |
| sand       | `#E8E2D6` | `#3A3730` | Objek yang bukan fokus |
| surface    | `#FFFFFF` | `#1E2533` | Bidang atas objek      |

Kolom Gelap diisi developer secara otomatis. Illustrator tidak perlu menggambar ulang, cukup memakai nama style-nya. Nilai gelapnya dicantumkan supaya bisa dipakai saat mengecek di artboard 0.4.

### Warna track

| Track                    | Nama   | Terang    | Gelap     |
| ------------------------ | ------ | --------- | --------- |
| Keuangan Pribadi         | petrol | `#146B63` | `#2FA095` |
| Project Management       | indigo | `#3446C4` | `#7488F0` |
| Data & Spreadsheet       | ochre  | `#A9720E` | `#D9A23C` |
| Logika & Berpikir Kritis | moss   | `#4A6B2A` | `#86AD5C` |
| Soft Skill               | plum   | `#7C3A6E` | `#B573A5` |

---

## Lampiran B. Arah gaya

Acuan bentuknya Brilliant. Empat hal sengaja dibedakan supaya tidak terbaca sebagai tiruan.

| Aspek      | Brilliant                                     | Verselab                                  |
| ---------- | --------------------------------------------- | ----------------------------------------- |
| Warna      | Satu palet ungu dan kuning untuk semua kursus | Satu warna per track                      |
| Bayangan   | Gradasi halus                                 | Pola titik halftone, tanpa gradasi        |
| Bentuk     | Membulat dan lembut                           | Membulat tapi bersudut jelas, radius 3 px |
| Latar tile | Putih polos                                   | Warna track yang sangat tipis             |

### Ciri khas: halftone

Bidang bayangan diisi pola titik rapat, bukan warna gelap solid dan bukan gradasi. Hasilnya terasa seperti ilustrasi buku cetak: hangat tapi tetap presisi. Ini pembeda paling jelas dari Brilliant walaupun bentuk dasarnya mirip.

Pola dibuat sekali di Batch 0, lalu dipakai ulang. Kerapatan titiknya harus sama di semua ilustrasi, jangan disetel ulang per gambar.

### Kenapa warna dibedakan per track

Verselab punya banyak track dan pengguna harus bisa langsung tahu ini materi apa hanya dari melihat gambarnya. Brilliant tidak butuh ini karena seluruh kursusnya bidang sains.

### Sudut pandang

Semua objek digambar isometrik pada sudut yang sama, mengikuti grid di Batch 0. Tidak ada perspektif, tidak ada titik hilang. Objek boleh punya bayangan tipis di lantai, tapi jangan bayangan kabur.
