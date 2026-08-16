# 📘 07-SECURITY.md
# SIMPEG SMAN 1 PRAMBON
## Security Specification

Version: 1.0.0

---

# 1. Security Objectives

Tujuan keamanan sistem:

- Menjaga kerahasiaan data pegawai.
- Menjamin integritas data.
- Menjamin ketersediaan layanan.
- Mendukung audit dan kepatuhan.

---

# 2. Security Principles

- Zero Trust
- Least Privilege
- Defense in Depth
- Secure by Default
- Principle of Least Knowledge

---

# 3. Authentication

- JWT Access Token
- Refresh Token
- Password Hash: Argon2id
- HTTPS wajib
- Logout menghapus refresh token aktif

---

# 4. Authorization (RBAC)

Role:

- Super Admin
- Fasilitator
- Individu

Permission minimum:

- View
- Create
- Update
- Delete
- Export
- Approve

Permission dicek melalui middleware dan policy.

---

# 5. Session Management

- Idle timeout (configurable)
- Token expiration
- Single device / multi device configurable
- Forced logout oleh Super Admin

---

# 6. Password Policy

- Minimal 12 karakter
- Huruf besar
- Huruf kecil
- Angka
- Karakter khusus
- Riwayat password (opsional roadmap)

---

# 7. Multi Factor Authentication

Roadmap:

- TOTP
- Email OTP

---

# 8. Upload Security

File yang diizinkan:

- PDF
- JPG
- PNG
- DOCX

Aturan:

- Validasi MIME
- Rename file
- Simpan di luar web root
- Batasi ukuran file
- Tolak executable

---

# 9. Data Protection

- Soft delete untuk data penting
- Backup harian
- Audit seluruh perubahan
- Enkripsi data sensitif bila diperlukan

---

# 10. Audit Log

Catat:

- Login
- Logout
- CRUD
- Approval
- Export
- Import
- Reset Password

Audit log tidak boleh dihapus oleh role biasa.

---

# 11. API Security

- HTTPS Only
- JWT
- Rate Limiting
- Input Validation
- Permission Middleware

---

# 12. OWASP Mitigation

Mitigasi:

- SQL Injection → Parameter Binding / ORM
- XSS → Output Escaping
- CSRF → Token Protection
- Broken Access Control → RBAC
- Security Misconfiguration → Environment Configuration
- Sensitive Data Exposure → Encryption & HTTPS

---

# 13. Backup Strategy

- Database Backup Harian
- File Backup Harian
- Retensi dapat dikonfigurasi
- Restore tervalidasi

---

# 14. Disaster Recovery

- Restore Database
- Restore Storage
- Restore Konfigurasi
- Uji restore berkala

---

# 15. Logging & Monitoring

Log:

- Application
- API
- Security
- Queue

Monitoring:

- Error Rate
- Response Time
- Failed Login

---

# 16. Environment Security

- Secret di .env
- Tidak commit .env
- APP_DEBUG=false pada production
- APP_KEY wajib unik

---

# 17. Security Checklist

- [ ] HTTPS aktif
- [ ] JWT aktif
- [ ] RBAC aktif
- [ ] Audit Log aktif
- [ ] Backup terjadwal
- [ ] Rate Limit aktif
- [ ] Validasi Upload
- [ ] Password Policy
- [ ] Error tidak membocorkan stack trace

---

# 18. Incident Response

Jika terjadi insiden:

1. Isolasi layanan
2. Simpan log
3. Analisis penyebab
4. Pemulihan
5. Dokumentasi

---

# 19. Future Security Roadmap

- MFA
- SSO
- SIEM Integration
- Digital Signature
- Device Trust

---

# 20. Closing

Dokumen ini menjadi pedoman keamanan resmi untuk seluruh proses
pengembangan, deployment, dan operasional SIMPEG.
