import { get } from "@/lib/api";
import type {
  ApiResponse,
  DashboardStats,
  DashboardChart,
  DashboardActivity,
  DashboardCuti,
  DashboardIndividuCuti,
  DashboardUltah,
  Pegawai,
} from "@/types";

export interface DashboardData {
  stats: DashboardStats;
  chart_status_kepegawaian: DashboardChart[];
  chart_jenis_pegawai: DashboardChart[];
  chart_jenis_kelamin: DashboardChart[];
  chart_golongan: DashboardChart[];
  chart_pertumbuhan: DashboardChart[];
  recent_activities: DashboardActivity[];
  cuti_menunggu: DashboardCuti[];
  ultah_bulan_ini: DashboardUltah[];
  /** Individu (self-service) scope only */
  scope?: string;
  /** Individu scope only: profil pegawai milik sendiri */
  pegawai?: Pegawai;
  /** Individu scope only: pengajuan cuti milik sendiri */
  cuti_terdekat?: DashboardIndividuCuti[];
}

export const dashboardService = {
  getDashboard() {
    return get<ApiResponse<DashboardData>>("/dashboard");
  },
};
