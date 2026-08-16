# 📘 04-UI-UX.md
# SIMPEG SMAN 1 PRAMBON
## UI / UX Design Specification

Version: 1.0.0

---

# 1. Design Vision

SIMPEG harus memberikan pengalaman seperti aplikasi SaaS modern,
bukan aplikasi administrasi konvensional.

Karakter utama:

- Modern
- Clean
- Premium
- Professional
- Responsive
- Fast
- Accessible

---

# 2. Design Inspiration

- Linear
- Vercel Dashboard
- GitHub
- Notion
- Stripe Dashboard

---

# 3. Design System

## Color Palette

| Role | Color |
|------|--------|
| Primary | #2563EB |
| Secondary | #0EA5E9 |
| Success | #22C55E |
| Warning | #F59E0B |
| Danger | #EF4444 |
| Background | #F8FAFC |

## Typography

- Heading: Plus Jakarta Sans
- Body: Inter
- Icon: Lucide

## Radius

- Card: 18px
- Button: 12px
- Input: 12px

---

# 4. Layout

```text
+---------------------------------------------------------+
| Header                                                  |
+-------------+-------------------------------------------+
| Sidebar     | Main Content                              |
|             |                                           |
|             |                                           |
+-------------+-------------------------------------------+
```

Sidebar dapat di-collapse.

---

# 5. Navigation

Dashboard

Pegawai

Master Data

Dokumen

Surat

Laporan

Pengaturan

---

# 6. Header

Kiri:
- Logo
- Nama Sistem
- Search

Kanan:
- Notification
- Theme Toggle
- Profile

---

# 7. Dashboard

Widget KPI:

- Total Pegawai
- Guru
- Staf
- PNS
- PPPK
- GTT
- PTT

Grafik:

- Status Pegawai
- Pendidikan
- Golongan
- Umur

Timeline:

- SK Baru
- KGB
- Ulang Tahun
- Pensiun

---

# 8. Pegawai

## List View

- Search
- Filter
- Sort
- Pagination

## Card View

Menampilkan:

- Foto
- Nama
- Jabatan
- Status
- Aksi Cepat

---

# 9. Profil Pegawai

Tab:

- Overview
- Identitas
- Kepegawaian
- Pendidikan
- Keluarga
- Dokumen
- Riwayat
- Aktivitas

Overview menggunakan layout seperti profil profesional.

---

# 10. Form UX

Wizard:

1. Identitas
2. Kepegawaian
3. Pendidikan
4. Dokumen
5. Konfirmasi

Validasi realtime.

Autosave opsional.

---

# 11. Upload UX

Drag & Drop

Preview:

- PDF
- JPG
- PNG
- DOCX

Progress upload wajib ditampilkan.

---

# 12. Search Experience

Global Search mendukung:

- Nama
- NIP
- NIK
- Jabatan
- Unit Kerja

Realtime search dengan debounce.

---

# 13. Notification Center

Jenis:

- Approval
- SK Baru
- Dokumen
- KGB
- Sistem

---

# 14. Empty State

Gunakan ilustrasi sederhana.

Contoh:

"Belum ada data pegawai."

Sediakan tombol aksi utama.

---

# 15. Loading State

Gunakan Skeleton Loading.

Hindari spinner untuk halaman utama.

---

# 16. Error State

Pesan singkat.

Jelaskan solusi jika memungkinkan.

---

# 17. Success Feedback

Gunakan Toast Notification.

Durasi 3-5 detik.

---

# 18. Responsive Rules

Desktop >=1280px

Laptop >=1024px

Tablet >=768px

Mobile >=390px

Mobile menggunakan bottom navigation untuk fitur utama.

---

# 19. Accessibility

- WCAG AA
- Keyboard Navigation
- Focus Indicator
- High Contrast
- Dark Mode

---

# 20. Animation

Gunakan Framer Motion.

Durasi:

150-250 ms

Animasi:

- Fade
- Slide
- Scale

Tidak berlebihan.

---

# 21. Component Library

- Button
- Card
- Badge
- Avatar
- Dialog
- Drawer
- Tabs
- Table
- Timeline
- Toast
- Tooltip
- Upload
- Date Picker
- Select
- Chart
- Skeleton

Semua komponen mengikuti shadcn/ui.

---

# 22. UX Flow

Pegawai Login

↓

Dashboard

↓

Lengkapi Profil

↓

Upload Dokumen

↓

Ajukan Layanan

↓

Pantau Status

---

# 23. Permission UX

Admin:
Semua menu.

Fasilitator:
Menu operasional.

Individu:
Hanya data pribadi.

Menu disembunyikan sesuai hak akses.

---

# 24. Design Rules

- Maksimal 3 klik menuju fitur utama.
- Gunakan whitespace yang cukup.
- Hindari tabel penuh jika dapat diganti card/timeline.
- Prioritaskan keterbacaan dibanding kepadatan informasi.

---

# 25. Closing

Dokumen ini menjadi acuan implementasi antarmuka dan pengalaman pengguna.
Seluruh halaman wajib mengikuti design system, komponen, dan prinsip UX
yang telah ditetapkan.
