# 📘 08-CODING-STANDARD.md
# SIMPEG SMAN 1 PRAMBON
## Engineering & Coding Standard

Version: 1.0.0

---

# 1. Tujuan

Dokumen ini menjadi standar implementasi seluruh source code SIMPEG agar
konsisten, mudah dipelihara, mudah diuji, dan siap dikembangkan.

---

# 2. Prinsip Utama

- Clean Code
- SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Separation of Concerns
- Convention over Configuration

---

# 3. Technology Standard

Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend
- Laravel 12
- PHP 8.4
- PostgreSQL
- Redis

---

# 4. Struktur Proyek

Backend mengikuti pola:

Controller
↓
Service
↓
Repository
↓
Model

Business logic hanya berada di Service.

---

# 5. Naming Convention

| Item | Format |
|------|--------|
| Class | PascalCase |
| Method | camelCase |
| Variable | camelCase |
| Constant | UPPER_CASE |
| File | kebab-case (frontend) |
| Database | snake_case |

---

# 6. Controller Rules

- Maksimal menangani request & response.
- Tidak boleh query database langsung.
- Tidak boleh berisi business logic.

---

# 7. Service Rules

Service bertanggung jawab terhadap:

- Business Rule
- Validasi proses
- Orkestrasi transaksi
- Pemanggilan repository

---

# 8. Repository Rules

Repository hanya bertugas mengakses database.

Tidak boleh berisi logika bisnis.

---

# 9. Validation Standard

Backend:
- Laravel Form Request

Frontend:
- React Hook Form
- Zod

Semua input wajib divalidasi di server.

---

# 10. Error Handling

Gunakan Exception yang spesifik.

Response API wajib konsisten.

Jangan tampilkan stack trace pada production.

---

# 11. Logging

Catat:

- Error
- Warning
- Informasi penting
- Aktivitas pengguna

---

# 12. API Standard

- RESTful
- JSON
- Versioning (/api/v1)
- Pagination
- Filtering
- Sorting

---

# 13. Frontend Standard

Komponen dibagi menjadi:

- UI
- Shared
- Feature
- Layout

Komponen harus reusable.

---

# 14. State Management

- TanStack Query
- React Context
- Local State

Hindari global state yang tidak diperlukan.

---

# 15. Styling Rules

- Tailwind CSS
- Utility First
- Hindari inline style
- Gunakan design token

---

# 16. Testing

Backend

- Unit Test
- Feature Test

Frontend

- Component Test
- Integration Test

---

# 17. Git Convention

Branch:

- main
- develop
- feature/*
- hotfix/*

Commit:

- feat:
- fix:
- refactor:
- docs:
- test:
- chore:

---

# 18. Documentation

Setiap modul wajib memiliki:

- README
- API
- Flow
- Validasi
- Permission
- Changelog

---

# 19. Code Review Checklist

- [ ] Tidak ada business logic di controller
- [ ] Validasi lengkap
- [ ] Error handling benar
- [ ] Test lulus
- [ ] Dokumentasi diperbarui
- [ ] Tidak ada duplikasi kode

---

# 20. Performance Guideline

- Hindari N+1 Query
- Gunakan eager loading
- Gunakan pagination
- Cache data referensi
- Lazy load bila diperlukan

---

# 21. Security Guideline

- Gunakan parameter binding
- Escape output
- Validasi upload
- Middleware permission
- Audit log

---

# 22. UI Component Standard

Komponen wajib:

- Stateless bila memungkinkan
- Memiliki props yang jelas
- Mudah diuji
- Mengikuti design system

---

# 23. Acceptance Criteria

Kode dinyatakan layak jika:

- Mengikuti dokumen ini
- Lulus test
- Lulus code review
- Tidak melanggar arsitektur

---

# 24. Checklist Implementasi Codex

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

# 25. Closing

Seluruh source code SIMPEG wajib mengikuti standar ini.
Perubahan terhadap standar harus melalui revisi dokumen agar konsistensi
proyek tetap terjaga.
