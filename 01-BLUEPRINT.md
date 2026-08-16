# 📘 BLUEPRINT.md
# SIMPEG SMAN 1 PRAMBON

**Version:** 1.0.0  
**Status:** Draft  
**Author:** ChatGPT (System Analyst)  
**Implementation:** Codex  
**Last Update:** August 2026

---

# 1. Executive Summary

SIMPEG merupakan Sistem Informasi Manajemen Kepegawaian berbasis web yang
dikembangkan khusus untuk SMAN 1 Prambon sebagai pusat pengelolaan data
kepegawaian secara terintegrasi.

Target utama aplikasi adalah menjadi platform digital yang modern,
aman, cepat, mudah digunakan, dan siap dikembangkan menjadi HRIS sekolah.

---

# 2. Vision

Menjadi platform manajemen kepegawaian digital yang modern, efisien,
aman, dan terintegrasi untuk mendukung tata kelola sumber daya manusia
di lingkungan SMAN 1 Prambon.

# 3. Mission

- Digitalisasi seluruh data kepegawaian.
- Mengurangi penggunaan dokumen fisik.
- Mempercepat administrasi.
- Menjadi pusat arsip digital.
- Menyediakan dashboard analitik.
- Menyediakan layanan mandiri pegawai.

# 4. Project Goals

1. Seluruh data pegawai berada pada satu database.
2. Memiliki histori kepegawaian lengkap.
3. Memudahkan pencarian dokumen.
4. Menghasilkan laporan otomatis.
5. Mendukung transformasi digital sekolah.

# 5. Scope

## In Scope

- Dashboard
- Master Pegawai
- Master Jabatan
- Master Pangkat
- Master Golongan
- Arsip Digital
- Riwayat Pegawai
- Surat
- Laporan
- Approval
- Notification
- User & Role Management
- Audit Log

## Out of Scope (Versi 1)

- Payroll
- Fingerprint
- Presensi
- Rekrutmen
- Mobile App

# 6. Stakeholder

## Internal

- Kepala Sekolah
- Wakil Kepala Sekolah
- Tata Usaha
- Guru
- Staf

## Eksternal

- Cabang Dinas
- Dinas Pendidikan
- Auditor

# 7. User Roles

## Super Admin

Akses penuh terhadap seluruh sistem.

## Fasilitator

Mengelola data pegawai, dokumen, laporan, reset akun, dan approval tertentu.

## Individu

Mengelola profil pribadi, dokumen, dan pengajuan layanan.

# 8. Jenis Pegawai

- Guru
- Staf

# 9. Status Kepegawaian

- PNS
- PPPK
- PPPK Paruh Waktu
- GTT
- PTT

# 10. Product Philosophy

- Modern
- Minimalis
- Cepat
- Enterprise
- Responsive
- Scalable
- Human Friendly

# 11. UI/UX Principles

- Maksimal 3 klik menuju fitur utama.
- Wizard untuk form panjang.
- Global Search.
- Drag & Drop Upload.
- Light & Dark Mode.

# 12. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Laravel 12
- REST API
- Redis Queue

## Database

- PostgreSQL

## Authentication

- JWT + Refresh Token

# 13. Security

- HTTPS
- Argon2id Password Hash
- JWT
- RBAC
- Audit Log
- CSRF Protection
- XSS Protection
- SQL Injection Protection

# 14. Coding Principles

- SOLID
- Clean Architecture
- Repository Pattern
- Service Layer
- Reusable Components
- Clean Code

# 15. Git Strategy

- main
- develop
- feature/*
- hotfix/*

# 16. Roadmap

1. Core SIMPEG
2. Arsip Digital
3. Workflow Approval
4. KGB
5. Kenaikan Pangkat
6. Dashboard Analitik
7. Integrasi Dapodik
8. Mobile API

# 17. Closing

Dokumen ini merupakan acuan utama pengembangan SIMPEG SMAN 1 Prambon.
Seluruh implementasi Codex wajib mengikuti prinsip, arsitektur, dan standar
yang dijelaskan pada dokumen ini.
