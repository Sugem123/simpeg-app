# SIMPEG - Sistem Informasi Manajemen Pegawai

Sistem manajemen data pegawai sekolah dengan sinkronisasi eMaster.

## Teknologi
- **Backend:** Laravel 12 (PHP 8.2) + JWT Auth
- **Frontend:** Next.js (React) + TanStack Query + Framer Motion
- **Database:** PostgreSQL 16 + Redis
- **Deployment:** Docker + Coolify

## Fitur Backend
- Manajemen data pegawai lengkap
- Riwayat jabatan, pangkat, mutasi
- Riwayat KGB (Kenaikan Gaji Berkala)
- Riwayat diklat dan pendidikan
- Manajemen cuti
- Dokumen pegawai
- Notifikasi
- Audit log
- Sinkronisasi dengan eMaster
- Permission system (RBAC)
- JWT authentication

## Models
Pegawai, Golongan, Jabatan, Pangkat, JenisPegawai, MataPelajaran, Cuti, Dokumen, RiwayatJabatan, RiwayatPangkat, RiwayatMutasi, RiwayatKgb, RiwayatDiklat, Pendidikan, Agama, Notifikasi, AuditLog, AktivitasLogin, Permission, PengaturanSekolah

## Fitur Frontend
- Dashboard pegawai
- React Query untuk data fetching
- Framer Motion animations
- Command palette (cmdk)
- Cookie-based auth
- Class variance authority (CVA)

## Deploy
- Backend Port: 8096
- Frontend Port: 8097
- Containers: simpeg-backend, simpeg-frontend, simpeg-db, simpeg-redis
