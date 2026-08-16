// ─── Base Interfaces ────────────────────────────────────────────

export interface User {
  id: string;
  pegawai_id: string;
  username: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
  roles: Role[];
  pegawai?: Pegawai;
}

export interface Role {
  id: string;
  nama: string;
  deskripsi: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  nama: string;
  modul: string;
}

export interface Pegawai {
  id: string;
  nip: string | null;
  nuptk: string | null;
  nik: string;
  nama: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  agama_id: string;
  jenis_pegawai_id: string;
  status_kepegawaian_id: string;
  jabatan_id: string | null;
  pangkat_id: string | null;
  golongan_id: string | null;
  unit_kerja_id: string | null;
  alamat: string | null;
  no_hp: string | null;
  email: string;
  foto: string | null;
  status_aktif: boolean;
  // Relations
  agama?: MasterData;
  jenis_pegawai?: MasterData;
  status_kepegawaian?: MasterData;
  jabatan?: MasterData;
  pangkat?: MasterData;
  golongan?: MasterData;
  unit_kerja?: MasterData;
  nama_lengkap?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MasterData {
  id: string;
  kode?: string;
  nama: string;
  jenjang?: string;
  deskripsi?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─── API Response Interfaces ────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Dashboard ──────────────────────────────────────────────────

export interface DashboardStats {
  total_pegawai: number;
  pegawai_aktif: number;
  pegawai_tidak_aktif: number;
  total_guru: number;
  total_staf: number;
  total_pns: number;
  total_pppk: number;
  total_gtt: number;
  total_ptt: number;
  total_dokumen: number;
  total_surat: number;
  cuti_menunggu: number;
  pegawai_baru_bulan_ini: number;
  /** Individu scope only */
  cuti_disetujui_tahun_ini?: number;
}

export interface DashboardChart {
  label: string;
  value: number;
  color?: string;
}

export interface DashboardActivity {
  id: string;
  description: string;
  user: string;
  modul: string;
  aksi: string;
  timestamp: string;
}

export interface DashboardCuti {
  id: string;
  pegawai: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

/** Individu scope: pengajuan cuti milik sendiri */
export interface DashboardIndividuCuti {
  id: string;
  jenis_cuti: string;
  status: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
}

export interface DashboardUltah {
  id: string;
  nama: string;
  tanggal_lahir: string;
}

// ─── Query Params ───────────────────────────────────────────────

export interface PegawaiQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status_kepegawaian_id?: string;
  jabatan_id?: string;
  unit_kerja_id?: string;
  jenis_pegawai_id?: string;
  status_aktif?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface MasterQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

// ─── Dokumen ────────────────────────────────────────────────────

export interface Dokumen {
  id: string;
  pegawai_id: string;
  kategori: string;
  nama_file: string;
  path: string;
  mime_type: string;
  ukuran: number;
  uploaded_by: string;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
  pegawai?: Pegawai;
  uploader?: User;
}

export type KategoriDokumen = Dokumen['kategori'];

export const KATEGORI_DOKUMEN_LABEL: Record<string, string> = {
  // User-uploadable
  ktp: 'KTP',
  kk: 'Kartu Keluarga',
  ijazah: 'Ijazah',
  sk: 'Surat Keputusan',
  sertifikat: 'Sertifikat',
  foto: 'Foto',
  npwp: 'NPWP',
  transkrip: 'Transkrip',
  lainnya: 'Lainnya',
  // eMaster BKD
  file_foto: 'Foto',
  file_foto_full: 'Foto Full Body',
  file_ktp: 'KTP',
  file_npwp: 'NPWP',
  file_akta_kelahiran: 'Akta Kelahiran',
  file_askes_bpjs: 'Askes/BPJS',
  file_karis_karsu: 'Karis/Karsu',
  file_karpeg: 'Karpeg',
  file_kartu_asn_virtual: 'Kartu ASN Virtual',
  file_kartu_taspen: 'Kartu Taspen',
  file_konversi_nip: 'Konversi NIP',
  file_kpe: 'KPE',
  file_ksk: 'KSK',
  file_medical_checkup_cpns: 'Medical Check-up CPNS',
  file_medical_checkup_pns: 'Medical Check-up PNS',
  file_nota_persetujuan_bkn: 'Nota Persetujuan BKN',
  file_spmt_cpns: 'SPMT CPNS',
  file_suket_bebas_narkoba_cpns: 'Suket Bebas Narkoba CPNS',
  file_suket_bebas_narkoba_pns: 'Suket Bebas Narkoba PNS',
  file_sumpah_pns: 'Sumpah PNS',
  file_taspen: 'Taspen',
};

// ─── Riwayat ────────────────────────────────────────────────────

export interface RiwayatJabatan {
  id: string;
  pegawai_id: string;
  jabatan_id: string;
  nomor_sk: string | null;
  tanggal_sk: string | null;
  tmt: string;
  keterangan: string | null;
  jabatan?: MasterData;
  created_at: string;
}

export interface RiwayatPangkat {
  id: string;
  pegawai_id: string;
  pangkat_id: string;
  golongan_id: string;
  nomor_sk: string | null;
  tanggal_sk: string | null;
  tmt: string;
  pangkat?: MasterData;
  golongan?: MasterData;
  created_at: string;
}

export interface RiwayatPendidikan {
  id: string;
  pegawai_id: string;
  jenjang: string;
  institusi: string;
  jurusan: string | null;
  tahun_lulus: number;
  nomor_ijazah: string | null;
  created_at: string;
}

export interface RiwayatKgb {
  id: string;
  pegawai_id: string;
  nomor_sk: string | null;
  tanggal_sk: string | null;
  tmt: string;
  gaji_pokok_lama: number | null;
  gaji_pokok_baru: number | null;
  created_at: string;
}

export interface RiwayatDiklat {
  id: string;
  pegawai_id: string;
  nama_diklat: string;
  penyelenggara: string | null;
  tahun: number | null;
  jam_pelajaran: number | null;
  nomor_sertifikat: string | null;
  created_at: string;
}

export interface RiwayatMutasi {
  id: string;
  pegawai_id: string;
  asal: string;
  tujuan: string;
  nomor_sk: string | null;
  tanggal_sk: string | null;
  tmt: string;
  keterangan: string | null;
  created_at: string;
}

export type RiwayatType = 'jabatan' | 'pangkat' | 'pendidikan' | 'kgb' | 'diklat' | 'mutasi';

// ─── Cuti ───────────────────────────────────────────────────────

export interface Cuti {
  id: string;
  pegawai_id: string;
  jenis_cuti: 'tahunan' | 'sakit' | 'melahirkan' | 'besar' | 'penting' | 'luar_tanggungan';
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: 'draft' | 'menunggu' | 'disetujui' | 'ditolak';
  approved_by: string | null;
  approved_at: string | null;
  catatan_approval: string | null;
  pegawai?: Pegawai;
  approver?: User;
  created_at: string;
  updated_at: string;
}

export type JenisCuti = Cuti['jenis_cuti'];
export type StatusCuti = Cuti['status'];

export const JENIS_CUTI_LABEL: Record<JenisCuti, string> = {
  tahunan: 'Cuti Tahunan',
  sakit: 'Cuti Sakit',
  melahirkan: 'Cuti Melahirkan',
  besar: 'Cuti Besar',
  penting: 'Cuti Karena Alasan Penting',
  luar_tanggungan: 'Cuti di Luar Tanggungan',
};

export const STATUS_CUTI_LABEL: Record<StatusCuti, string> = {
  draft: 'Draft',
  menunggu: 'Menunggu Persetujuan',
  disetujui: 'Disetujui',
  ditolak: 'Ditolak',
};

export const STATUS_CUTI_COLOR: Record<StatusCuti, string> = {
  draft: 'secondary',
  menunggu: 'warning',
  disetujui: 'success',
  ditolak: 'destructive',
};

// ─── Surat ──────────────────────────────────────────────────────

export interface Surat {
  id: string;
  nomor: string;
  jenis: 'sk' | 'surat_tugas' | 'pakta_integritas' | 'surat_keterangan';
  pegawai_id: string;
  perihal: string | null;
  tanggal: string;
  file_pdf: string | null;
  created_by: string;
  pegawai?: Pegawai;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export type JenisSurat = Surat['jenis'];

export const JENIS_SURAT_LABEL: Record<JenisSurat, string> = {
  sk: 'Surat Keputusan',
  surat_tugas: 'Surat Tugas',
  pakta_integritas: 'Pakta Integritas',
  surat_keterangan: 'Surat Keterangan',
};

// ─── Notifikasi ─────────────────────────────────────────────────

export interface Notifikasi {
  id: string;
  user_id: string;
  judul: string;
  pesan: string;
  jenis: string;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

// ─── Audit ──────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  user_id: string | null;
  aksi: string;
  modul: string;
  deskripsi: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: User;
}

// ─── Pengaturan Sekolah ─────────────────────────────────────────

export interface SchoolProfile {
  id?: string;
  nama: string;
  npsn: string | null;
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  website: string | null;
  logo_path: string | null;
  logo_url: string | null;
  kepala_sekolah: string | null;
  nip_kepala: string | null;
}

// ─── Additional Query Params ────────────────────────────────────

export interface CutiQueryParams {
  page?: number;
  per_page?: number;
  status?: StatusCuti;
  pegawai_id?: string;
}

export interface SuratQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  jenis?: JenisSurat;
}

export interface AuditQueryParams {
  page?: number;
  per_page?: number;
  modul?: string;
  aksi?: string;
  user_id?: string;
  tanggal_from?: string;
  tanggal_to?: string;
}
