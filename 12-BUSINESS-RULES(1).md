# 📘 12-BUSINESS-RULES.md
# SIMPEG SMAN 1 PRAMBON
## Business Rules Specification

Version: 1.0.0

---

# 1. Pendahuluan

Dokumen ini mendefinisikan seluruh aturan bisnis (Business Rules) yang
harus diterapkan pada Service Layer, API, dan antarmuka aplikasi.

Seluruh implementasi wajib mengacu pada dokumen ini.

---

# 2. Aturan Data Pegawai

## Identitas

- NIK harus unik.
- NIP harus unik apabila diisi.
- Email harus unik.
- Nama tidak boleh kosong.
- Tanggal lahir tidak boleh melebihi tanggal saat ini.

## Status Aktif

Status pegawai:
- Aktif
- Cuti
- Tugas Belajar
- Mutasi
- Pensiun
- Berhenti

Pegawai nonaktif tidak dapat login kecuali diaktifkan kembali.

---

# 3. Jenis Pegawai

Jenis pegawai:
- Guru
- Staf

Status kepegawaian:
- PNS
- PPPK
- PPPK Paruh Waktu
- GTT
- PTT

Status kepegawaian disimpan pada master dan tidak ditulis bebas.

---

# 4. User Account

- Setiap pegawai maksimal memiliki satu akun.
- Akun dibuat setelah data pegawai selesai.
- Username tidak boleh duplikat.
- Password awal wajib diganti saat login pertama.

---

# 5. Dokumen Digital

Dokumen wajib:
- KTP
- KK
- Foto

Dokumen opsional:
- Ijazah
- Sertifikat
- SK
- NPWP

Aturan:
- Hanya format yang diizinkan.
- Dokumen lama tidak dihapus, tetapi dapat dibuat versi baru.

---

# 6. Riwayat

Riwayat bersifat permanen.

Tidak boleh dihapus.

Perubahan jabatan, pangkat, pendidikan, dan KGB harus menghasilkan
entri riwayat baru.

---

# 7. Workflow Cuti

Pegawai
→ Ajukan
→ Validasi
→ Fasilitator
→ Super Admin
→ Disetujui / Ditolak

Jika ditolak, alasan wajib diisi.

---

# 8. Workflow Dokumen

Upload
→ Validasi
→ Tersimpan
→ Siap digunakan

Jika file gagal validasi maka tidak boleh disimpan.

---

# 9. Workflow KGB

- Hitung jadwal berikutnya.
- Tampilkan notifikasi H-90, H-30, H-7.
- Simpan riwayat setiap perubahan.

---

# 10. Workflow Kenaikan Pangkat

- Data pendukung lengkap.
- Jadwal memenuhi syarat.
- Dokumen diverifikasi.
- Riwayat diperbarui.

---

# 11. Audit

Seluruh aktivitas berikut wajib dicatat:

- Login
- Logout
- CRUD
- Upload
- Download
- Export
- Approval
- Reset Password

---

# 12. Penghapusan Data

Hard delete:
- Tidak diperbolehkan untuk data pegawai.

Soft delete:
- Pegawai
- Dokumen
- Surat
- Cuti

Master yang telah digunakan tidak boleh dihapus.

---

# 13. Notifikasi

Sistem mengirim notifikasi untuk:

- KGB
- Cuti
- Dokumen ditolak
- Dokumen disetujui
- Akun dibuat
- Password direset

---

# 14. Laporan

Semua laporan menggunakan data aktif secara default.

Filter:
- Status
- Jabatan
- Unit Kerja
- Pendidikan
- Golongan

---

# 15. Import Data

Import hanya melalui template resmi.

Validasi:
- Kolom wajib
- Format tanggal
- NIK unik
- NIP unik

Jika ada error, tampilkan laporan error tanpa menyimpan data.

---

# 16. Export Data

Format:
- Excel
- PDF

Export dicatat pada audit log.

---

# 17. Dashboard

Dashboard hanya menampilkan data yang berhak diakses oleh pengguna.

Individu hanya melihat ringkasan miliknya.

---

# 18. Error Rules

Pesan error harus:
- Jelas
- Tidak membocorkan informasi sistem
- Memberikan arahan perbaikan jika memungkinkan

---

# 19. Future Rules

Disiapkan untuk:
- Integrasi Dapodik
- e-Kinerja
- Tanda Tangan Elektronik
- Mobile App
- Single Sign-On

---

# 20. Acceptance Criteria

- Seluruh aturan diterapkan di Service Layer.
- Tidak ada business logic di Controller.
- Seluruh workflow memiliki audit log.
- Seluruh validasi berjalan di backend.

---

# Penutup

Dokumen ini menjadi sumber utama logika bisnis SIMPEG.
Perubahan proses bisnis harus direvisi pada dokumen ini sebelum
diimplementasikan ke dalam kode.
