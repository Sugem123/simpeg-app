# 📘 10-DATABASE-DICTIONARY.md
# SIMPEG SMAN 1 PRAMBON
## Database Dictionary

Version: 1.0.0

---

# Pendahuluan

Dokumen ini menjadi referensi resmi seluruh struktur database SIMPEG.
Setiap migration, model, repository, service, dan API WAJIB mengacu pada dokumen ini.

---

# Standar Umum

| Item | Standar |
|------|----------|
| Primary Key | UUID |
| Timestamp | created_at, updated_at |
| Soft Delete | deleted_at (bila diperlukan) |
| Charset | UTF-8 |
| Database | PostgreSQL |

---

# Tabel : users

## Fungsi
Menyimpan akun login seluruh pengguna.

| Kolom | Tipe | Wajib | Keterangan |
|-------|------|:----:|------------|
| id | uuid | ✓ | Primary Key |
| pegawai_id | uuid | ✓ | Relasi ke pegawai |
| username | varchar(50) | ✓ | Unik |
| email | varchar(150) | ✓ | Unik |
| password | varchar(255) | ✓ | Argon2id Hash |
| is_active | boolean | ✓ | Status akun |
| last_login_at | timestamp | | Login terakhir |
| created_at | timestamp | ✓ | Audit |
| updated_at | timestamp | ✓ | Audit |

Index:
- username
- email

---

# Tabel : pegawai

## Fungsi
Master identitas pegawai.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid | PK |
| nip | varchar(30) | Unik |
| nuptk | varchar(30) | Nullable |
| nik | varchar(16) | Unik |
| nama | varchar(200) | Nama lengkap |
| gelar_depan | varchar(30) | Nullable |
| gelar_belakang | varchar(50) | Nullable |
| tempat_lahir | varchar(100) |  |
| tanggal_lahir | date |  |
| jenis_kelamin | char(1) | L/P |
| agama_id | uuid | FK |
| jenis_pegawai_id | uuid | FK |
| status_kepegawaian_id | uuid | FK |
| jabatan_id | uuid | FK |
| pangkat_id | uuid | FK |
| golongan_id | uuid | FK |
| unit_kerja_id | uuid | FK |
| alamat | text |  |
| no_hp | varchar(20) |  |
| email | varchar(150) | Unik |
| foto | varchar(255) | Path file |
| status_aktif | boolean | Default true |
| created_at | timestamp |  |
| updated_at | timestamp |  |
| deleted_at | timestamp | Soft delete |

Business Rules:
- NIK unik.
- NIP unik jika terisi.
- Email unik.
- Tidak boleh hard delete.

---

# Tabel : roles

| Kolom | Tipe |
|-------|------|
| id | uuid |
| nama | varchar(50) |
| deskripsi | text |

Default:
- Super Admin
- Fasilitator
- Individu

---

# Tabel : permissions

Contoh data:

- pegawai.view
- pegawai.create
- pegawai.update
- pegawai.delete
- pegawai.export
- pegawai.approve

---

# Tabel : jabatan

Kolom:
- id
- kode
- nama
- keterangan

---

# Tabel : golongan

Kolom:
- id
- kode
- nama

---

# Tabel : pangkat

Kolom:
- id
- kode
- nama

---

# Tabel : status_kepegawaian

Data awal:

- PNS
- PPPK
- PPPK Paruh Waktu
- GTT
- PTT

---

# Tabel : jenis_pegawai

Data awal:

- Guru
- Staf

---

# Tabel : dokumen

Kolom utama:

- id
- pegawai_id
- kategori
- nama_file
- path
- mime_type
- ukuran
- uploaded_by
- created_at

Kategori:
- KTP
- KK
- Ijazah
- SK
- Sertifikat
- Foto

---

# Tabel : riwayat_jabatan

Kolom:
- pegawai_id
- jabatan_id
- nomor_sk
- tanggal_sk
- tmt
- keterangan

---

# Tabel : riwayat_pangkat

Kolom:
- pegawai_id
- pangkat_id
- golongan_id
- nomor_sk
- tanggal_sk
- tmt

---

# Tabel : riwayat_pendidikan

Kolom:
- pegawai_id
- jenjang
- institusi
- jurusan
- tahun_lulus
- nomor_ijazah

---

# Tabel : cuti

Kolom:
- pegawai_id
- jenis_cuti
- tanggal_mulai
- tanggal_selesai
- alasan
- status
- approved_by

Status:
- Draft
- Menunggu
- Disetujui
- Ditolak

---

# Tabel : surat

Kolom:
- nomor
- jenis
- pegawai_id
- tanggal
- file_pdf

---

# Tabel : audit_logs

Kolom:
- user_id
- aksi
- modul
- ip_address
- user_agent
- metadata (jsonb)
- created_at

Audit tidak boleh diubah.

---

# Index Strategy

Index wajib:

- nip
- nik
- email
- username
- pegawai_id
- status_kepegawaian_id
- jabatan_id

---

# Foreign Key Strategy

- ON UPDATE CASCADE
- ON DELETE RESTRICT
- Soft delete untuk data transaksional

---

# Penutup

Dokumen ini merupakan referensi utama desain skema database.
Perubahan struktur tabel wajib diperbarui di dokumen ini sebelum implementasi migration.
