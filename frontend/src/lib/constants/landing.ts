import {
  Users,
  Files,
  LayoutDashboard,
  BarChart3,
  ShieldCheck,
  FileText,
  Database,
  Briefcase,
  FolderArchive,
  ScrollText,
  LineChart,
  Lock,
  ServerCog,
  FileCheck2,
  GraduationCap,
  Building2,
  type LucideIcon,
} from "lucide-react";

// ─── Brand ──────────────────────────────────────────────────────

export const BRAND = {
  name: "SIMPEG",
  school: "SMAN 1 PRAMBON",
  tagline: "Digital Human Resource Platform",
  description:
    "Kelola seluruh administrasi kepegawaian dalam satu platform modern, aman, terintegrasi, dan mudah digunakan.",
  version: "v1.0.0",
  logoPath: "/logo-sman1prambon.svg",
};

// ─── Navigation ─────────────────────────────────────────────────

export const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Modul", href: "#modul" },
  { label: "Keamanan", href: "#keamanan" },
  { label: "Teknologi", href: "#teknologi" },
  { label: "Kontak", href: "#kontak" },
] as const;

// ─── Hero Badges ────────────────────────────────────────────────

export const HERO_TRUST_BADGES = [
  { icon: ShieldCheck, label: "Aman & Terpercaya" },
  { icon: ServerCog, label: "Terintegrasi" },
  { icon: Users, label: "Mudah Digunakan" },
  { icon: Lock, label: "Data Terlindungi" },
] as const;

// ─── Statistics ─────────────────────────────────────────────────

export interface StatItem {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
  trend: string;
}

export const STATISTICS: StatItem[] = [
  { icon: GraduationCap, label: "Guru", value: 82, suffix: "Orang", trend: "+8% dari bulan lalu" },
  { icon: Briefcase, label: "Staf", value: 18, suffix: "Orang", trend: "+4% dari bulan lalu" },
  { icon: FolderArchive, label: "Dokumen", value: 4580, suffix: "File", trend: "+15% dari bulan lalu" },
  { icon: Building2, label: "Unit Kerja", value: 12, suffix: "Unit", trend: "+6% dari bulan lalu" },
];

// ─── Features ───────────────────────────────────────────────────

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: Users,
    title: "Data Pegawai",
    description:
      "Kelola data pegawai secara lengkap, akurat, dan terstruktur dalam satu sistem terintegrasi.",
  },
  {
    icon: FolderArchive,
    title: "Arsip Digital",
    description:
      "Simpan dan kelola dokumen kepegawaian secara digital, aman, dan mudah ditemukan.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Interaktif",
    description:
      "Pantau informasi penting dengan dashboard interaktif dan visualisasi data yang informatif.",
  },
  {
    icon: BarChart3,
    title: "Analitik & Laporan",
    description:
      "Dapatkan insight dari data kepegawaian dengan laporan dan analitik yang komprehensif.",
  },
  {
    icon: ShieldCheck,
    title: "Keamanan Enterprise",
    description:
      "Sistem aman dengan enkripsi, role akses, audit log, dan backup berkala.",
  },
  {
    icon: FileText,
    title: "Laporan Otomatis",
    description:
      "Buat laporan kepegawaian otomatis dengan format yang siap digunakan.",
  },
];

// ─── Workflow Timeline ──────────────────────────────────────────

export const WORKFLOW_STEPS = [
  { icon: Users, label: "Pegawai", description: "Registrasi data awal" },
  { icon: FileCheck2, label: "Upload Dokumen", description: "Unggah kelengkapan" },
  { icon: ShieldCheck, label: "Verifikasi", description: "Validasi data & dokumen" },
  { icon: FileCheck2, label: "Approval", description: "Persetujuan atasan" },
  { icon: FolderArchive, label: "Arsip Digital", description: "Tersimpan aman" },
  { icon: LineChart, label: "Laporan", description: "Analitik & output" },
] as const;

// ─── Module Preview Tabs ────────────────────────────────────────

export interface ModulePreview {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const MODULE_PREVIEWS: ModulePreview[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "KPI, grafik, dan aktivitas real-time" },
  { id: "pegawai", label: "Pegawai", icon: Users, description: "CRUD data pegawai lengkap" },
  { id: "profil", label: "Profil", icon: Briefcase, description: "Profil pegawai dengan tab detail" },
  { id: "dokumen", label: "Dokumen", icon: FolderArchive, description: "Arsip digital & upload drag-drop" },
  { id: "riwayat", label: "Riwayat", icon: ScrollText, description: "Riwayat jabatan, pangkat, pendidikan" },
  { id: "laporan", label: "Laporan", icon: FileText, description: "Export PDF & Excel otomatis" },
];

// ─── Technology Stack ───────────────────────────────────────────

export const TECH_STACK = [
  { name: "Laravel", role: "Backend Framework", color: "from-red-500 to-pink-500" },
  { name: "Next.js", role: "Frontend Framework", color: "from-zinc-500 to-zinc-700" },
  { name: "PostgreSQL", role: "Database", color: "from-sky-500 to-blue-700" },
  { name: "Redis", role: "Cache & Queue", color: "from-red-600 to-rose-700" },
  { name: "Docker", role: "Containerization", color: "from-blue-500 to-indigo-600" },
  { name: "Tailwind CSS", role: "Styling", color: "from-cyan-400 to-sky-600" },
  { name: "TypeScript", role: "Type Safety", color: "from-blue-500 to-indigo-600" },
];

// ─── Security Features ──────────────────────────────────────────

export const SECURITY_FEATURES = [
  { icon: Lock, title: "RBAC", description: "Role Based Access Control granular" },
  { icon: ShieldCheck, title: "JWT Authentication", description: "Token aman dengan refresh" },
  { icon: FileText, title: "Audit Log", description: "Seluruh aktivitas tercatat" },
  { icon: Lock, title: "HTTPS", description: "Enkripsi end-to-end" },
  { icon: ServerCog, title: "Backup Berkala", description: "Data terlindungi otomatis" },
];

// ─── Contact / Footer ───────────────────────────────────────────

export const CONTACT_INFO = {
  address: "Jl. Raya Prambon No. 1, Prambon, Sidoarjo, Jawa Timur",
  phone: "(031) 798-1234",
  email: "info@sman1prambon.sch.id",
};

export const FOOTER_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Data Pegawai", href: "/pegawai" },
  { label: "Master Data", href: "/master-data" },
  { label: "Dokumen", href: "/dokumen" },
];