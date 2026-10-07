# EduPlatform — LMS Sekolah (Tahap 3: Admin + Guru)

Stack: Next.js 14 (App Router), MongoDB + Mongoose, NextAuth (credentials), Tailwind CSS, lucide-react.

## Menjalankan
1. `npm install`
2. Salin `.env.example` menjadi `.env.local`, isi `MONGODB_URI` dan `NEXTAUTH_SECRET`
3. `npm run seed` (buat admin) / `npm run seed:reset` (reset password admin) / `npm run check` (diagnosa login)
4. `npm run dev` lalu buka http://localhost:3000

## Admin (/admin)
Beranda, Kelas & Siswa, Guru & Pelajaran, Kurikulum & Kepsek.

## Guru (/guru)
- Beranda: ringkasan mengajar, kelas, tenggat terdekat
- Kelas & Siswa: kelas yang diajar + daftar siswa
- Materi: unggah PDF (maks 10 MB) dan/atau tautan, untuk satu atau beberapa kelas
- Tugas & Projek: buat tugas (PDF + tautan, tenggat, nilai maks), lihat pengumpulan, beri nilai & umpan balik
- Asesmen: kuis & ujian online (pilihan ganda + esai), draft/terbit, penilaian esai
- Rekap Nilai: per siswa, per kelas, per jurusan, bobot bisa diatur, unduh CSV

### Aturan penugasan guru
Guru mengajar kombinasi (kelas, mapel) yang berasal dari:
1. Guru pengajar yang diatur admin di detail kelas, dan
2. Mata pelajaran dengan guru pengampu = guru tsb, untuk semua kelas pada tingkat yang diajar mapel itu.

### Catatan teknis
- File PDF disimpan di MongoDB (koleksi `filedocs`) dan hanya bisa dibuka lewat `/api/files/:id` oleh pihak yang berhak.
- Model `Submission` dan `Attempt` sudah disiapkan untuk role siswa (tahap berikutnya).
