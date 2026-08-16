# 📘 13-UI-COMPONENT-LIBRARY.md
# SIMPEG SMAN 1 PRAMBON
## Enterprise UI Component Library

Version: 1.0.0

---

# 1. Purpose

Dokumen ini menjadi acuan seluruh implementasi komponen antarmuka
agar konsisten, reusable, accessible, dan sesuai Design System.

---

# 2. Technology

- React 19
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Framer Motion

---

# 3. Design Tokens

## Radius

- xs : 6px
- sm : 8px
- md : 12px
- lg : 18px
- xl : 24px

## Spacing

Gunakan kelipatan 4px.

---

# 4. Typography

Heading : Plus Jakarta Sans

Body : Inter

Code : JetBrains Mono

---

# 5. Layout Components

- AppLayout
- AuthLayout
- DashboardLayout
- PageContainer
- ContentSection
- Sidebar
- Header
- Footer

---

# 6. Navigation Components

- Sidebar Navigation
- Breadcrumb
- Top Navigation
- Bottom Navigation (Mobile)
- User Menu

---

# 7. Form Components

- Text Input
- Textarea
- Select
- Multi Select
- Date Picker
- Checkbox
- Radio
- Switch
- Password Field
- File Upload
- Wizard Stepper

Semua mendukung validasi.

---

# 8. Data Display

- Card
- Badge
- Avatar
- Timeline
- Statistic Card
- Empty State
- Data Table
- Description List

---

# 9. Feedback Components

- Toast
- Alert
- Dialog
- Confirm Dialog
- Skeleton
- Progress Bar
- Loading Overlay

---

# 10. Dashboard Components

- KPI Card
- Activity Timeline
- Chart Card
- Recent Activity
- Quick Action

---

# 11. Pegawai Components

- Employee Card
- Employee Header
- Employee Profile Tabs
- Document Grid
- History Timeline

---

# 12. Table Standard

Semua tabel wajib mendukung:

- Pagination
- Search
- Sort
- Filter
- Export
- Responsive

---

# 13. Upload Component

Fitur:

- Drag & Drop
- Preview
- Progress
- Retry
- Remove

---

# 14. Modal Rules

Gunakan modal untuk:

- Konfirmasi
- Form singkat

Gunakan halaman penuh untuk form kompleks.

---

# 15. Color Usage

Primary:
Aksi utama

Success:
Berhasil

Warning:
Perhatian

Danger:
Hapus / gagal

Info:
Informasi

---

# 16. Icon Rules

Lucide Icons digunakan secara konsisten.

Setiap menu memiliki ikon.

---

# 17. Animation

Framer Motion

Durasi:

150–250ms

Animasi:

- Fade
- Slide
- Scale

---

# 18. Accessibility

- Keyboard Friendly
- Focus Ring
- ARIA Label
- Color Contrast AA
- Screen Reader Friendly

---

# 19. Responsive Rules

Desktop

Laptop

Tablet

Mobile

Semua komponen wajib adaptif.

---

# 20. Component Checklist

Setiap komponen wajib:

- Reusable
- Typed (TypeScript)
- Accessible
- Responsive
- Documented
- Unit Tested

---

# Penutup

Seluruh halaman SIMPEG wajib menggunakan komponen pada dokumen ini.
Tidak diperbolehkan membuat komponen baru apabila fungsi yang sama
telah tersedia di library proyek.
