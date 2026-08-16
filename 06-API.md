# 📘 06-API.md
# SIMPEG SMAN 1 PRAMBON
## REST API Contract Specification

Version: 1.0.0

---

# 1. API Principles

- RESTful API
- JSON Only
- Versioning (/api/v1)
- JWT Authentication
- HTTPS Only
- Consistent Response Format

---

# 2. Base URL

```
/api/v1
```

---

# 3. Standard Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

---

# 4. Standard Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field": ["message"]
  }
}
```

---

# 5. Authentication Flow

POST /auth/login

POST /auth/refresh

POST /auth/logout

GET /auth/me

Headers

```
Authorization: Bearer <JWT>
```

---

# 6. Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| POST | /auth/refresh | Refresh Token |
| GET | /auth/me | Current User |

---

# 7. User API

GET /users

GET /users/{id}

POST /users

PATCH /users/{id}

DELETE /users/{id}

PATCH /users/{id}/reset-password

PATCH /users/{id}/activate

PATCH /users/{id}/deactivate

---

# 8. Pegawai API

GET /pegawai

GET /pegawai/{id}

POST /pegawai

PATCH /pegawai/{id}

DELETE /pegawai/{id}

GET /pegawai/search

GET /pegawai/export

POST /pegawai/import

---

# 9. Master Data API

Resource:

- jenis-pegawai
- status-kepegawaian
- jabatan
- pangkat
- golongan
- agama
- unit-kerja
- pendidikan

Semua menggunakan pola REST CRUD.

---

# 10. Dokumen API

GET /pegawai/{id}/dokumen

POST /pegawai/{id}/dokumen

PATCH /dokumen/{id}

DELETE /dokumen/{id}

GET /dokumen/{id}/download

GET /dokumen/{id}/preview

---

# 11. Riwayat API

GET /pegawai/{id}/riwayat

GET /pegawai/{id}/riwayat-pangkat

GET /pegawai/{id}/riwayat-jabatan

GET /pegawai/{id}/riwayat-pendidikan

GET /pegawai/{id}/riwayat-kgb

---

# 12. Surat API

GET /surat

POST /surat

PATCH /surat/{id}

DELETE /surat/{id}

GET /surat/{id}/pdf

---

# 13. Cuti API

GET /cuti

POST /cuti

PATCH /cuti/{id}

PATCH /cuti/{id}/approve

PATCH /cuti/{id}/reject

---

# 14. Dashboard API

GET /dashboard

GET /dashboard/statistik

GET /dashboard/timeline

GET /dashboard/notifikasi

---

# 15. Notification API

GET /notifications

PATCH /notifications/{id}/read

PATCH /notifications/read-all

---

# 16. Audit API

GET /audit

GET /audit/{id}

Filter:

- tanggal
- user
- modul
- aksi

---

# 17. Pagination Standard

Query:

```
?page=1
&per_page=20
```

Response meta:

```json
{
  "page":1,
  "per_page":20,
  "total":100
}
```

---

# 18. Filtering

Contoh:

```
?status=PNS
&jabatan=guru
&search=budi
&sort=nama
&direction=asc
```

---

# 19. HTTP Status

| Code | Meaning |
|------|---------|
|200|OK|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation|
|500|Server Error|

---

# 20. Upload Rules

- Max file configurable
- PDF
- JPG
- PNG
- DOCX

Semua file discan validasi MIME.

---

# 21. API Security

- JWT
- Refresh Token
- Rate Limiter
- Permission Middleware
- Audit Log
- HTTPS

---

# 22. API Versioning

Versi pertama:

```
/api/v1
```

Perubahan breaking dibuat pada:

```
/api/v2
```

---

# 23. Naming Convention

Resource menggunakan bentuk jamak.

Contoh:

/pegawai

/users

/dokumen

Bukan camelCase.

---

# 24. Acceptance Criteria

- Seluruh endpoint terdokumentasi.
- Response konsisten.
- Validasi server-side wajib.
- Semua endpoint memiliki authorization.

---

# 25. Closing

Dokumen ini menjadi kontrak resmi antara frontend Next.js dan backend Laravel.
Perubahan endpoint wajib diperbarui pada dokumen ini sebelum implementasi.
