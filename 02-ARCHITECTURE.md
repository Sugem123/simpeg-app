# 📘 02-ARCHITECTURE.md
# SIMPEG SMAN 1 PRAMBON
## System Architecture Specification

Version: 1.0.0

---

# 1. Architecture Goals

Arsitektur dirancang agar:

- Modular
- Mudah dipelihara
- Mudah diuji
- Mudah dikembangkan
- Siap dipisah menjadi microservices di masa depan

Pendekatan yang digunakan adalah **Modular Monolith**.

---

# 2. High Level Architecture

```text
Browser
    │
Next.js Frontend
    │
REST API
    │
Laravel Application
    │
Service Layer
    │
Repository Layer
    │
PostgreSQL
```

Redis digunakan untuk cache, queue, dan session.

---

# 3. Architectural Principles

- Separation of Concerns
- SOLID
- DRY
- KISS
- Clean Architecture
- Feature First Development

---

# 4. Layer Architecture

```text
Presentation
    │
Application (Service)
    │
Domain
    │
Infrastructure
    │
Persistence
```

## Presentation

- Next.js
- React
- Form Validation
- Routing

## Application

- Business Rules
- Use Case
- DTO
- Service

## Domain

- Entity
- Value Object
- Policy

## Infrastructure

- Storage
- Queue
- Notification
- Email

## Persistence

- Repository
- PostgreSQL
- Redis

---

# 5. Folder Structure (Backend)

```text
app/
 ├── Actions
 ├── DTO
 ├── Enums
 ├── Events
 ├── Exceptions
 ├── Helpers
 ├── Http
 ├── Jobs
 ├── Models
 ├── Notifications
 ├── Policies
 ├── Providers
 ├── Repositories
 ├── Services
 ├── Traits
 └── ValueObjects
```

---

# 6. Folder Structure (Frontend)

```text
src/
 ├── app
 ├── components
 ├── features
 ├── hooks
 ├── layouts
 ├── lib
 ├── services
 ├── stores
 ├── styles
 ├── types
 └── utils
```

---

# 7. Feature Modules

- Authentication
- Dashboard
- Master Data
- Pegawai
- Dokumen
- Riwayat
- Surat
- Laporan
- Pengaturan

Setiap module wajib independen.

---

# 8. Backend Pattern

Controller

↓

Service

↓

Repository

↓

Model

Controller tidak boleh berisi business logic.

---

# 9. Frontend Pattern

Page

↓

Feature

↓

Component

↓

Shared Component

Komponen bersifat reusable.

---

# 10. Dependency Rules

Allowed:

Presentation → Service

Service → Repository

Repository → Database

Forbidden:

Controller → Database

Component → API langsung (wajib melalui service)

---

# 11. State Management

- TanStack Query
- React Context (global ringan)
- Local State untuk UI

---

# 12. API Convention

RESTful API

/api/v1/

Semua response:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

---

# 13. Error Handling

Gunakan global exception handler.

Response error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

---

# 14. Logging

Semua aktivitas penting dicatat:

- Login
- Logout
- CRUD Pegawai
- Approval
- Export
- Upload Dokumen

---

# 15. File Storage

Dokumen dipisahkan berdasarkan kategori:

storage/

pegawai/

dokumen/

surat/

foto/

Backup mendukung Local dan S3 Compatible.

---

# 16. Security Layer

- JWT Authentication
- RBAC Middleware
- Policy Authorization
- Rate Limiting
- Audit Log

---

# 17. Scalability

Modul dirancang dapat dipisahkan menjadi service mandiri:

- Notification
- Document
- Reporting

tanpa mengubah business logic utama.

---

# 18. Development Rules

- Tidak boleh query di Controller.
- Tidak boleh business logic di View.
- Seluruh validasi memakai Form Request / Zod.
- Semua endpoint wajib terdokumentasi.

---

# 19. Testing Strategy

Backend

- Unit Test
- Feature Test

Frontend

- Component Test
- Integration Test

---

# 20. Closing

Dokumen ini menjadi acuan teknis seluruh implementasi Codex.
Seluruh modul wajib mengikuti arsitektur, layer, dependency,
dan struktur folder yang telah ditetapkan.
