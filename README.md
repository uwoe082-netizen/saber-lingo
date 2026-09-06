# WordWise Journey

Buatkan aplikasi web bernama "Lingo-SRS" — aplikasi belajar Bahasa Inggris

& Mandarin berbasis sains belajar (retrieval practice, spaced repetition,

interleaving, metakognisi). Fokus utama saya adalah fungsi & alur

pengguna di bawah ini — kamu bebas menentukan gaya visual, tata letak,

warna, tipografi, dan komponen UI sesuai selera desainmu sendiri.

KONTEKS PENGGUNA

Aplikasi dipakai setiap hari, sesi singkat (5-15 menit), lewat HP sebagai

kebiasaan harian (seperti Duolingo). Desain harus mobile-first, nyaman

dipakai satu tangan, minim friksi untuk mulai sesi.

=== HALAMAN 1: BERANDA / DASHBOARD ===

Ini halaman pertama yang dilihat pengguna. Isinya:

- Ringkasan singkat: berapa materi yang "jatuh tempo" untuk direview hari

  ini, dan progres kasar per bahasa (Inggris/Mandarin) per level

  (Pemula/Menengah/Mahir).

- Satu tombol call-to-action utama yang jelas: "Mulai Sesi Hari Ini".

- Riwayat singkat beberapa sesi terakhir (tanggal, jumlah soal, rata-rata

  keyakinan diri/metakognisi).

Nada halaman ini: memotivasi tanpa terasa memaksa/menghakimi kalau

pengguna telat beberapa hari.

=== HALAMAN 2: SESI BELAJAR (inti aplikasi) ===

Alur satu soal, diulang sampai sesi selesai (target 10-15 soal per sesi):

1. Tampilkan SATU soal per waktu (bukan daftar sekaligus) — supaya

   pengguna fokus mengingat aktif (retrieval), bukan membaca pasif.

2. Setiap soal punya label kecil yang menunjukkan: bahasa (Inggris/

   Mandarin), tipe (kosakata/tata bahasa/nada/terjemahan), dan level.

   Antar-soal SENGAJA berganti-ganti bahasa & tipe (interleaving) — ini

   perlu terlihat jelas ke pengguna supaya dia sadar variasinya

   disengaja, bukan acak asal.

3. Pengguna mengetik jawaban di kolom teks (bukan pilihan ganda) lalu

   submit.

4. Setelah submit, tampilkan feedback jelas: benar/salah, dan kalau

   salah tunjukkan jawaban yang benar.

5. SEGERA setelah feedback, minta pengguna menilai keyakinan dirinya

   sendiri terhadap jawaban tadi, skala 1-4:

     1 = Lupa total/menebak

     2 = Ingat tapi ragu-ragu

     3 = Ingat, cukup yakin

     4 = Sangat yakin/mudah

   Ini WAJIB diisi tiap soal, tampilkan sebagai 4 pilihan besar yang

   gampang di-tap (bukan slider kecil).

6. Setelah rating diberikan, tunjukkan sekilas info kapan materi ini akan

   muncul lagi (misal "akan direview lagi 3 hari lagi") — supaya

   pengguna paham sistem spaced repetition-nya bekerja, tapi jangan

   sampai mengganggu ritme menjawab soal berikutnya.

7. Lanjut otomatis ke soal berikutnya, tampilkan progress bar/indikator

   "soal ke-X dari Y".

8. Di akhir sesi (semua soal selesai): tampilkan ringkasan (rata-rata

   keyakinan diri sepanjang sesi), lalu minta SATU pertanyaan penutup:

   seberapa menantang sesi ini secara keseluruhan (skala 1-4 juga).

   Setelah dijawab, sesi tersimpan dan kembali ke beranda.

Rasa yang diinginkan di halaman ini: cepat, ritmis, seperti main game

kartu — bukan seperti mengisi form ujian.

=== HALAMAN 3: PROGRESS / DASHBOARD DETAIL ===

Tampilkan progres lebih rinci dari yang ada di beranda:

- Per bahasa, per level (Pemula/Menengah/Mahir): berapa persen materi

  yang sudah "dikuasai" (sudah beberapa kali direview dengan baik) vs

  masih baru/masih sering salah.

- Materi mana saja yang paling sering salah/susah (supaya pengguna sadar

  titik lemahnya).

- Grafik atau visual sederhana tren keyakinan diri (metakognisi) dari

  waktu ke waktu.

=== HALAMAN 4: PETA KURIKULUM ===

Tampilan visual jalur belajar dari Pemula -> Menengah -> Mahir, untuk

kedua bahasa, menunjukkan topik apa saja di tiap level dan level mana

yang sudah "terbuka" untuk pengguna saat ini (level lanjut baru terbuka

setelah level sebelumnya cukup dikuasai) vs yang masih terkunci.

=== HALAMAN 5: REKOMENDASI KURSUS EKSTERNAL ===

Daftar rekomendasi kursus Coursera (nama, penyedia, link, level) untuk

kedua bahasa, dikelompokkan per level. Ini murni informasi referensi,

bukan bagian dari sistem pembelajaran utama — desain sebagai halaman

sekunder/terpisah, tidak perlu menonjol seperti Halaman 1-2.

=== HAL PENTING UNTUK DATA (biar backend bisa kamu bikinkan) ===

Aplikasi ini butuh menyimpan, per pengguna:

- Daftar materi belajar (soal, jawaban, bahasa, level, topik, tipe).

- Progres tiap materi: berapa kali dilihat, skor keyakinan diri

  terakhir, tanggal harus direview lagi berikutnya.

- Riwayat sesi belajar (tanggal, jumlah soal, rata-rata keyakinan diri,

  tingkat kesulitan sesi).

Tolong buatkan skema datanya (misalnya pakai Supabase) yang mendukung

struktur di atas.

YANG TIDAK PERLU DIPIKIRKAN DULU:

- Sistem login/multi-user kompleks (single user dulu tidak apa-apa).

- Desain visual spesifik — bebas berkreasi.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ea10de7-029a-464c-831c-3cbb322afc4b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
