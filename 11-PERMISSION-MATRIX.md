# 📘 11-PERMISSION-MATRIX.md
# SIMPEG SMAN 1 PRAMBON
## Role Based Access Control (RBAC)

Version: 1.0.0

---

# 1. Tujuan

Dokumen ini menjadi acuan resmi implementasi Role Based Access Control (RBAC)
untuk seluruh menu, fitur, endpoint API, dan aksi pada SIMPEG.

Role:
- Super Admin
- Fasilitator
- Individu

Aksi:
- View
- Create
- Update
- Delete
- Import
- Export
- Approve
- Reset Password

---

# 2. Definisi Role

## Super Admin
Akses penuh terhadap seluruh sistem.

## Fasilitator
Mengelola data operasional kepegawaian.

## Individu
Hanya mengakses data miliknya sendiri.

---

# 3. Matriks Hak Akses

| Modul | View | Create | Update | Delete | Import | Export | Approve | Super Admin | Fasilitator | Individu |
|-------|:---:|:------:|:------:|:------:|:------:|:------:|:-------:|:-----------:|:-----------:|:--------:|
| Dashboard | ✓ | - | - | - | - | - | - | ✓ | ✓ | ✓ |
| Pegawai | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ | Own |
| Dokumen | ✓ | ✓ | ✓ | ✓ | - | ✓ | - | ✓ | ✓ | Own |
| Riwayat | ✓ | ✓ | ✓ | ✗ | - | ✓ | - | ✓ | ✓ | Own |
| Surat | ✓ | ✓ | ✓ | ✓ | - | ✓ | ✓ | ✓ | ✓ | View Own |
| Cuti | ✓ | ✓ | ✓ | ✗ | - | ✓ | ✓ | ✓ | ✓ | Own |
| Laporan | ✓ | - | - | - | - | ✓ | - | ✓ | ✓ | ✗ |
| User | ✓ | ✓ | ✓ | ✓ | - | - | - | ✓ | ✗ | ✗ |
| Role | ✓ | ✓ | ✓ | ✓ | - | - | - | ✓ | ✗ | ✗ |
| Audit Log | ✓ | - | - | ✗ | - | ✓ | - | ✓ | Read | ✗ |
| Pengaturan | ✓ | ✓ | ✓ | ✗ | - | - | - | ✓ | Terbatas | ✗ |

Keterangan:
- Own = hanya data milik sendiri.
- Read = hanya baca.

---

# 4. Permission Code

## Pegawai
- pegawai.view
- pegawai.create
- pegawai.update
- pegawai.delete
- pegawai.export
- pegawai.import

## Dokumen
- dokumen.view
- dokumen.upload
- dokumen.update
- dokumen.delete
- dokumen.download

## Surat
- surat.view
- surat.create
- surat.update
- surat.delete
- surat.approve

## Cuti
- cuti.view
- cuti.create
- cuti.update
- cuti.approve
- cuti.reject

## User
- user.view
- user.create
- user.update
- user.delete
- user.reset_password

---

# 5. Business Rules

1. Individu tidak boleh melihat data pegawai lain.
2. Fasilitator dapat membuka akun pegawai tanpa mengetahui password lama.
3. Super Admin dapat mengambil alih seluruh akun.
4. Audit Log tidak boleh dihapus.
5. Permission selalu dicek di Backend.

---

# 6. Middleware Mapping

- auth
- verified
- permission
- role
- throttle

Contoh:

permission:pegawai.update

---

# 7. UI Rules

- Menu yang tidak memiliki izin tidak ditampilkan.
- Tombol aksi disembunyikan jika tidak memiliki permission.
- Endpoint tetap melakukan validasi meskipun tombol disembunyikan.

---

# 8. API Rules

Semua endpoint wajib:
- Authentication
- Authorization
- Audit Log

Response jika tidak memiliki izin:

HTTP 403 Forbidden

---

# 9. Future Roles (Roadmap)

- Kepala Sekolah
- Wakil Kepala Sekolah
- Kepala TU
- Auditor
- Pengawas

Dokumen ini telah disiapkan agar mudah diperluas.

---

# 10. Closing

Dokumen ini menjadi acuan implementasi RBAC pada frontend, backend,
middleware, policy Laravel, dan navigasi aplikasi.
