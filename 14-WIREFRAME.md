# 📘 14-WIREFRAME.md
# SIMPEG SMAN 1 PRAMBON
## Wireframe & Navigation Specification

Version: 1.0.0

---

# 1. Tujuan

Dokumen ini mendeskripsikan struktur halaman, navigasi, dan wireframe
awal sebagai acuan implementasi frontend.

---

# 2. Sitemap

```text
Login
│
└── Dashboard
    ├── Pegawai
    │   ├── Daftar Pegawai
    │   ├── Profil Pegawai
    │   └── Riwayat
    ├── Master Data
    ├── Dokumen
    ├── Surat
    ├── Cuti
    ├── Laporan
    └── Pengaturan
```

---

# 3. Layout Utama

```text
+--------------------------------------------------------------+
| Header                                                       |
+-----------+--------------------------------------------------+
| Sidebar   | Breadcrumb                                       |
|           +--------------------------------------------------+
|           | Content                                           |
|           |                                                   |
|           |                                                   |
+-----------+--------------------------------------------------+
```

---

# 4. Login

```text
+--------------------------------------+
|             Logo                     |
|                                      |
| Username                             |
| Password                             |
|                                      |
| [ Login ]                            |
+--------------------------------------+
```

---

# 5. Dashboard

```text
+------------------------------------------------------+
| KPI | KPI | KPI | KPI                                |
+------------------------------------------------------+
| Grafik Status | Grafik Pendidikan                    |
+------------------------------------------------------+
| Timeline Aktivitas | Notifikasi                      |
+------------------------------------------------------+
```

---

# 6. Daftar Pegawai

```text
Search ____________________ [+ Tambah]

--------------------------------------------------------
Foto | Nama | Jabatan | Status | Aksi
--------------------------------------------------------
```

Tersedia mode:
- List
- Card

---

# 7. Profil Pegawai

```text
+-----------------------------------------------+
| Foto | Nama | Jabatan | Status                |
+-----------------------------------------------+
| Tabs: Overview | Identitas | Dokumen | Riwayat|
+-----------------------------------------------+
| Konten Tab                                    |
+-----------------------------------------------+
```

---

# 8. Dokumen

```text
Drag & Drop Area

--------------------------------------
Kategori | Nama | Preview | Download
--------------------------------------
```

---

# 9. Cuti

```text
[Ajukan Cuti]

Status:
Draft
Menunggu
Disetujui
Ditolak
```

---

# 10. Laporan

Filter:
- Status
- Jabatan
- Unit Kerja
- Periode

Output:
- PDF
- Excel

---

# 11. Pengaturan

Menu:

- Profil Sekolah
- User
- Role
- Backup
- SMTP
- Tema

---

# 12. Mobile Layout

```text
Header

Content

Bottom Navigation

Dashboard | Pegawai | Cari | Notif | Profil
```

---

# 13. User Flow

## Super Admin

Login
→ Dashboard
→ Master Data
→ Pegawai
→ Pengaturan

## Fasilitator

Login
→ Dashboard
→ Pegawai
→ Dokumen
→ Laporan

## Individu

Login
→ Dashboard
→ Profil
→ Dokumen
→ Cuti

---

# 14. Navigation Rules

- Maksimal 3 klik ke fitur utama.
- Breadcrumb selalu aktif.
- Sidebar dapat di-collapse.
- Search tersedia di header.

---

# 15. Empty / Loading / Error

Empty:
"Belum ada data."

Loading:
Skeleton UI.

Error:
Alert dengan tindakan yang disarankan.

---

# 16. Penutup

Wireframe ini menjadi acuan awal implementasi halaman.
Desain visual akhir mengikuti UI Design System dan Component Library.
