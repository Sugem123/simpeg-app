# 📘 05-MODULE-SPEC.md
# SIMPEG SMAN 1 PRAMBON
## Functional Module Specification

Version: 1.0.0

---

# Pendahuluan

Dokumen ini mendefinisikan seluruh modul fungsional SIMPEG.
Setiap modul wajib diimplementasikan secara independen dengan
arsitektur yang telah ditetapkan pada ARCHITECTURE.md.

---

# MODUL 1 - Authentication

## Tujuan
Mengamankan akses aplikasi menggunakan Role Based Access Control (RBAC).

## Fitur
- Login
- Logout
- Refresh Token
- Lupa Password
- Ganti Password
- Session Management

## Role
- Super Admin
- Fasilitator
- Individu

## Acceptance Criteria
- JWT valid
- Role terbaca
- Session aman

---

# MODUL 2 - Dashboard

## Tujuan
Menyajikan informasi utama secara real-time.

## Widget
- Total Pegawai
- Guru
- Staf
- PNS
- PPPK
- GTT
- PTT

## Grafik
- Status Pegawai
- Pendidikan
- Golongan
- Jenis Kelamin

## Aktivitas
- Login terakhir
- Dokumen terbaru
- KGB
- Pegawai pensiun

---

# MODUL 3 - Master Data

## Master
- Jenis Pegawai
- Status Kepegawaian
- Jabatan
- Pangkat
- Golongan
- Agama
- Unit Kerja
- Mata Pelajaran
- Pendidikan

## Business Rules
- Hanya Super Admin yang dapat menghapus master.
- Soft delete jika data telah dipakai.

---

# MODUL 4 - Pegawai

## Fungsi
CRUD data pegawai.

## Data
- Biodata
- Kepegawaian
- Pendidikan
- Keluarga
- Rekening
- Kontak

## Aksi
- Tambah
- Edit
- Nonaktifkan
- Cetak Biodata
- Export

## Validasi
- NIP unik
- NIK unik
- Email unik

---

# MODUL 5 - Profil Pegawai

## Tab
- Overview
- Identitas
- Kepegawaian
- Pendidikan
- Dokumen
- Riwayat
- Aktivitas

## UX
Menggunakan tab dan timeline, bukan satu form panjang.

---

# MODUL 6 - Dokumen Digital

## Jenis
- KTP
- KK
- Ijazah
- Transkrip
- SK
- Sertifikat
- NPWP
- Foto

## Fitur
- Upload
- Preview
- Download
- Versi Dokumen

---

# MODUL 7 - Riwayat

## Riwayat
- Pangkat
- Jabatan
- Pendidikan
- Diklat
- Mutasi
- KGB

Seluruh riwayat bersifat immutable (tidak boleh dihapus).

---

# MODUL 8 - Surat

## Jenis
- SK
- Surat Tugas
- Pakta Integritas
- Surat Keterangan

## Fitur
- Template
- Generate PDF
- Arsip
- QR Code (Roadmap)

---

# MODUL 9 - Cuti

## Alur

Pegawai

↓

Ajukan

↓

Fasilitator

↓

Super Admin

↓

Disetujui / Ditolak

## Status
- Draft
- Menunggu
- Disetujui
- Ditolak

---

# MODUL 10 - KGB

## Fitur
- Jadwal KGB
- Notifikasi
- Riwayat
- Cetak

---

# MODUL 11 - Kenaikan Pangkat

## Fitur
- Riwayat
- Jadwal
- Dokumen Pendukung
- Monitoring

---

# MODUL 12 - Notification Center

## Jenis
- Sistem
- Approval
- KGB
- Surat
- Dokumen

Realtime jika memungkinkan.

---

# MODUL 13 - Laporan

## Output
- PDF
- Excel

## Filter
- Status
- Golongan
- Jabatan
- Pendidikan
- Masa Kerja

---

# MODUL 14 - Audit Log

Catat:
- Login
- Logout
- CRUD
- Export
- Approval
- Upload

Audit tidak boleh diubah oleh pengguna biasa.

---

# MODUL 15 - User Management

## Fitur
- Tambah User
- Reset Password
- Aktivasi
- Nonaktifkan
- Assign Role

---

# MODUL 16 - Role & Permission

Role:
- Super Admin
- Fasilitator
- Individu

Permission berbasis menu dan aksi:
- View
- Create
- Update
- Delete
- Export
- Approve

---

# MODUL 17 - Settings

- Profil Sekolah
- Backup
- Restore
- SMTP
- Logo
- Tema
- Parameter Sistem

---

# Standar Semua Modul

Setiap modul wajib memiliki:

1. Tujuan
2. Business Rules
3. Permission Matrix
4. UI Screen
5. API Endpoint
6. Validasi
7. Error Handling
8. Acceptance Criteria
9. Unit Test
10. Dokumentasi

---

# Checklist Implementasi Codex

- [ ] Migration
- [ ] Model
- [ ] Repository
- [ ] Service
- [ ] Policy
- [ ] Controller
- [ ] API
- [ ] Validation
- [ ] Frontend
- [ ] Test
- [ ] Dokumentasi

---

# Closing

Dokumen ini menjadi pedoman implementasi seluruh modul SIMPEG.
Tidak ada modul yang boleh dikembangkan di luar standar yang ditetapkan
tanpa revisi dokumen spesifikasi ini.
