"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { dashboardService } from "@/services/dashboard-service";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";
import type { DashboardData } from "@/services/dashboard-service";
import {
  Users,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  FileCheck2,
  UserCheck,
  UserCog,
  UserPlus,
  FileText,
  Mail,
  CalendarOff,
  CalendarCheck,
  Cake,
  TrendingUp,
  Activity,
  Clock,
  UserRound,
  PencilLine,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "#f5c542",
  "#38bdf8",
  "#34d399",
  "#a78bfa",
  "#fb7185",
  "#f97316",
  "#14b8a6",
];

const tooltipStyle = {
  borderRadius: "12px",
  background: "#0E1830",
  border: "1px solid #1B2740",
  boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
  fontSize: "13px",
  color: "#e8eaf2",
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { isIndividuOnly } = usePermission();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.getDashboard(),
    refetchInterval: 60_000,
  });

  // Server marks the payload with scope:"individu" for self-service users;
  // fall back to the role check so the correct layout shows even mid-load.
  const individuOnly = data?.data?.scope === "individu" || isIndividuOnly();

  const stats = data?.data?.stats;
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const growthData = data?.data?.chart_pertumbuhan ?? [];
  const statusData = data?.data?.chart_status_kepegawaian ?? [];
  const jenisData = data?.data?.chart_jenis_pegawai ?? [];
  const kelaminData = data?.data?.chart_jenis_kelamin ?? [];
  const activities = data?.data?.recent_activities ?? [];
  const cutiList = data?.data?.cuti_menunggu ?? [];
  const ultahList = data?.data?.ultah_bulan_ini ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Greeting Header ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-[80px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400/80">
              {today}
            </p>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {getGreeting()},{" "}
              <span className="text-gold-gradient">
                {user?.pegawai?.nama ?? user?.username ?? "Admin"}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {individuOnly
                ? "Berikut ringkasan profil dan data kepegawaian Anda."
                : "Ringkasan sistem informasi manajemen kepegawaian hari ini."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {individuOnly ? (
              <>
                <Link
                  href={
                    user?.pegawai_id
                      ? `/pegawai/${user.pegawai_id}`
                      : "/pegawai"
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] px-4 py-2.5 text-sm font-bold text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:brightness-110"
                >
                  <UserRound className="size-4" />
                  Data Saya
                </Link>
                <Link
                  href="/cuti"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-amber-400/25 hover:text-amber-300"
                >
                  <CalendarOff className="size-4" />
                  Ajukan Cuti
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/pegawai/create"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] px-4 py-2.5 text-sm font-bold text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)] transition-all hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:brightness-110"
                >
                  <UserPlus className="size-4" />
                  Tambah Pegawai
                </Link>
                <Link
                  href="/surat"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-amber-400/25 hover:text-amber-300"
                >
                  <Mail className="size-4" />
                  Buat Surat
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Error ───────────────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Gagal memuat data dashboard. Pastikan server backend berjalan di
          http://localhost:8000.
        </div>
      )}

      {/* ─── Primary KPI Row ────────────────────────────────── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[128px] rounded-2xl" />
          ))}
        </div>
      ) : individuOnly ? (
        <IndividuSections payload={data?.data} />
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard
              label="Total Pegawai"
              value={stats?.total_pegawai ?? 0}
              icon={Users}
              color="gold"
              trend={{
                value: stats?.pegawai_baru_bulan_ini ?? 0,
                isPositive: true,
              }}
            />
            <KpiCard
              label="Guru"
              value={stats?.total_guru ?? 0}
              icon={GraduationCap}
              color="sky"
            />
            <KpiCard
              label="Staf"
              value={stats?.total_staf ?? 0}
              icon={Briefcase}
              color="purple"
            />
            <KpiCard
              label="Pegawai Aktif"
              value={stats?.pegawai_aktif ?? 0}
              icon={ShieldCheck}
              color="green"
            />
          </motion.div>

          {/* ─── Secondary KPI Row ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard
              label="PNS"
              value={stats?.total_pns ?? 0}
              icon={FileCheck2}
              color="blue"
            />
            <KpiCard
              label="PPPK"
              value={stats?.total_pppk ?? 0}
              icon={UserCheck}
              color="amber"
            />
            <KpiCard
              label="GTT"
              value={stats?.total_gtt ?? 0}
              icon={UserCog}
              color="orange"
            />
            <KpiCard
              label="PTT"
              value={stats?.total_ptt ?? 0}
              icon={UserCog}
              color="rose"
            />
          </motion.div>

          {/* ─── Mini stat pills ────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid gap-4 sm:grid-cols-3"
          >
            <MiniStat
              icon={FileText}
              label="Total Dokumen"
              value={stats?.total_dokumen ?? 0}
              href="/dokumen"
            />
            <MiniStat
              icon={Mail}
              label="Total Surat"
              value={stats?.total_surat ?? 0}
              href="/surat"
            />
            <MiniStat
              icon={CalendarOff}
              label="Cuti Menunggu"
              value={stats?.cuti_menunggu ?? 0}
              href="/cuti"
              highlight
            />
          </motion.div>

          {/* ─── Charts Row 1: Growth + Status ─────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {/* Growth area chart — spans 2 */}
            <ChartCard
              title="Pertumbuhan Pegawai"
              description="Total kumulatif 6 bulan terakhir"
              className="lg:col-span-2"
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={growthData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="goldGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f5c542"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f5c542"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1B2740"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      fontSize={12}
                      stroke="#8b94a9"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      stroke="#8b94a9"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f5c542"
                      strokeWidth={2}
                      fill="url(#goldGradient)"
                      dot={{
                        fill: "#f5c542",
                        r: 3,
                        strokeWidth: 0,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Donut jenis pegawai */}
            <ChartCard
              title="Jenis Pegawai"
              description="Distribusi guru & staf"
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jenisData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="label"
                      strokeWidth={0}
                    >
                      {jenisData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", color: "#8b94a9" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>

          {/* ─── Charts Row 2: Status bar + Kelamin donut ──────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            <ChartCard
              title="Status Kepegawaian"
              description="Distribusi pegawai per status"
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1B2740"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      fontSize={12}
                      stroke="#8b94a9"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={12}
                      stroke="#8b94a9"
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {statusData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard
              title="Jenis Kelamin"
              description="Komposisi L & P"
            >
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kelaminData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="label"
                      strokeWidth={0}
                    >
                      {kelaminData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 0 ? "#38bdf8" : "#fb7185"
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px", color: "#8b94a9" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </motion.div>

          {/* ─── Bottom Row: Activities + Cuti + Birthdays ────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            {/* Recent Activities */}
            <ChartCard
              title="Aktivitas Terbaru"
              description="Log aktivitas sistem"
              className="lg:col-span-1"
            >
              <div className="flex max-h-[340px] flex-col gap-1 overflow-y-auto pr-1">
                {activities.length > 0 ? (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-white/5"
                    >
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                        <Activity className="size-3.5" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm leading-snug text-foreground/90">
                          {act.description}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                            {act.modul}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3" />
                            {act.timestamp
                              ? new Date(act.timestamp).toLocaleString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-400/70">
                          oleh {act.user}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Belum ada aktivitas terbaru
                  </p>
                )}
              </div>
            </ChartCard>

            {/* Pending Cuti */}
            <ChartCard
              title="Cuti Menunggu Persetujuan"
              description={`${cutiList.length} pengajuan menunggu`}
              action={
                <Link
                  href="/cuti"
                  className="text-xs font-medium text-amber-400 hover:text-amber-300"
                >
                  Lihat semua
                </Link>
              }
            >
              <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
                {cutiList.length > 0 ? (
                  cutiList.map((cuti) => (
                    <Link
                      key={cuti.id}
                      href="/cuti"
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-amber-400/20 hover:bg-white/5"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-orange-400">
                        <CalendarOff className="size-4" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          {cuti.pegawai}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {cuti.jenis_cuti} &middot;{" "}
                          {cuti.tanggal_mulai &&
                            new Date(cuti.tanggal_mulai).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" }
                            )}
                          {" \u2013 "}
                          {cuti.tanggal_selesai &&
                            new Date(cuti.tanggal_selesai).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "short" }
                            )}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada cuti menunggu
                  </p>
                )}
              </div>
            </ChartCard>

            {/* Birthdays this month */}
            <ChartCard
              title="Ulang Tahun Bulan Ini"
              description={new Date().toLocaleDateString("id-ID", {
                month: "long",
              })}
            >
              <div className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1">
                {ultahList.length > 0 ? (
                  ultahList.map((p) => {
                    const tgl = p.tanggal_lahir
                      ? new Date(p.tanggal_lahir)
                      : null;
                    const isToday =
                      tgl &&
                      tgl.getDate() === new Date().getDate() &&
                      tgl.getMonth() === new Date().getMonth();
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                          <Cake className="size-4" />
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {p.nama}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {tgl?.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                        {isToday && (
                          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            Hari ini
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada ulang tahun bulan ini
                  </p>
                )}
              </div>
            </ChartCard>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─── Mini stat pill ─────────────────────────────────────────────

function MiniStat({
  icon: Icon,
  label,
  value,
  href,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`gold-hairline group relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
        highlight
          ? "border-amber-400/25 bg-amber-400/[0.06]"
          : "border-white/8 bg-white/[0.04] hover:border-amber-400/20"
      }`}
    >
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${
          highlight
            ? "bg-gradient-to-br from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_4px_20px_rgba(251,191,36,0.3)]"
            : "bg-white/5 text-amber-400 ring-1 ring-white/10"
        }`}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[13px] text-muted-foreground">{label}</span>
        <span className="font-heading text-xl font-bold text-foreground">
          {value.toLocaleString("id-ID")}
        </span>
      </div>
      <TrendingUp className="ml-auto size-4 text-muted-foreground/30 transition-colors group-hover:text-amber-400/50" />
    </Link>
  );
}

// ─── Individu (self-service) dashboard ─────────────────────────

function cutiStatusBadge(status: string): string {
  const s = (status ?? "").toLowerCase();
  if (s.includes("setuju")) return "bg-emerald-400/10 text-emerald-400";
  if (s.includes("tolak")) return "bg-rose-400/10 text-rose-400";
  return "bg-amber-400/10 text-amber-400";
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "-"}</dd>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="gold-hairline group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-sm transition-all hover:border-amber-400/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 ring-1 ring-white/10">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground group-hover:text-amber-300">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </Link>
  );
}

function IndividuSections({ payload }: { payload?: DashboardData }) {
  const stats = payload?.stats;
  const pegawai = payload?.pegawai;
  const cutiTerdekat = payload?.cuti_terdekat ?? [];
  const ultahList = payload?.ultah_bulan_ini ?? [];

  const profileHref = pegawai?.id ? `/pegawai/${pegawai.id}` : "/pegawai";
  const editHref = pegawai?.id ? `/pegawai/${pegawai.id}/edit` : "/pegawai";
  const fullName = pegawai
    ? [pegawai.gelar_depan, pegawai.nama, pegawai.gelar_belakang]
        .filter(Boolean)
        .join(" ")
    : "-";

  return (
    <>
      {/* ─── KPI Row ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Dokumen Saya"
          value={stats?.total_dokumen ?? 0}
          icon={FileText}
          color="gold"
        />
        <KpiCard
          label="Surat Saya"
          value={stats?.total_surat ?? 0}
          icon={Mail}
          color="sky"
        />
        <KpiCard
          label="Cuti Menunggu"
          value={stats?.cuti_menunggu ?? 0}
          icon={CalendarOff}
          color="amber"
        />
        <KpiCard
          label="Cuti Disetujui"
          value={stats?.cuti_disetujui_tahun_ini ?? 0}
          icon={CalendarCheck}
          color="green"
        />
      </motion.div>

      {/* ─── Profile summary + quick links ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/10 blur-[70px]" />
          <div className="relative mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold tracking-tight">
                Profil Saya
              </h3>
              <p className="text-xs text-muted-foreground">
                Ringkasan data kepegawaian Anda
              </p>
            </div>
            <Link
              href={editHref}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-amber-400/25 hover:text-amber-300"
            >
              <PencilLine className="size-3.5" />
              Edit Data Diri
            </Link>
          </div>
          <dl className="relative grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <ProfileRow label="Nama Lengkap" value={fullName} />
            <ProfileRow label="NIP" value={pegawai?.nip} />
            <ProfileRow
              label="Jabatan"
              value={pegawai?.jabatan?.nama}
            />
            <ProfileRow
              label="Pangkat / Golongan"
              value={
                [pegawai?.pangkat?.nama, pegawai?.golongan?.kode]
                  .filter(Boolean)
                  .join(" / ") || undefined
              }
            />
            <ProfileRow
              label="Status Kepegawaian"
              value={pegawai?.status_kepegawaian?.nama}
            />
            <ProfileRow
              label="Unit Kerja"
              value={pegawai?.unit_kerja?.nama}
            />
            <ProfileRow label="Email" value={pegawai?.email} />
            <ProfileRow label="No. HP" value={pegawai?.no_hp} />
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <QuickLink
            href={profileHref}
            icon={UserRound}
            title="Profil Saya"
            description="Lihat detail profil & riwayat"
          />
          <QuickLink
            href="/cuti"
            icon={CalendarOff}
            title="Cuti Saya"
            description="Lihat & ajukan pengajuan cuti"
          />
          <QuickLink
            href={profileHref}
            icon={FileText}
            title="Dokumen Saya"
            description="Kelola dokumen digital"
          />
        </div>
      </motion.div>

      {/* ─── Cuti terdekat + ulang tahun ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid gap-4 lg:grid-cols-2"
      >
        <ChartCard
          title="Cuti Saya"
          description="Pengajuan cuti terbaru"
          action={
            <Link
              href="/cuti"
              className="text-xs font-medium text-amber-400 hover:text-amber-300"
            >
              Lihat semua
            </Link>
          }
        >
          <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
            {cutiTerdekat.length > 0 ? (
              cutiTerdekat.map((cuti) => (
                <Link
                  key={cuti.id}
                  href="/cuti"
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-amber-400/20 hover:bg-white/5"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-400/10 text-orange-400">
                    <CalendarOff className="size-4" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {cuti.jenis_cuti}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {cuti.tanggal_mulai &&
                        new Date(cuti.tanggal_mulai).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short" }
                        )}
                      {" \u2013 "}
                      {cuti.tanggal_selesai &&
                        new Date(cuti.tanggal_selesai).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short" }
                        )}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cutiStatusBadge(cuti.status)}`}
                  >
                    {cuti.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada pengajuan cuti
              </p>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Ulang Tahun"
          description={new Date().toLocaleDateString("id-ID", {
            month: "long",
          })}
        >
          <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1">
            {ultahList.length > 0 ? (
              ultahList.map((p) => {
                const tgl = p.tanggal_lahir
                  ? new Date(p.tanggal_lahir)
                  : null;
                const isToday =
                  tgl &&
                  tgl.getDate() === new Date().getDate() &&
                  tgl.getMonth() === new Date().getMonth();
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                      <Cake className="size-4" />
                    </div>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {p.nama}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {tgl?.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        Hari ini
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada ulang tahun bulan ini
              </p>
            )}
          </div>
        </ChartCard>
      </motion.div>
    </>
  );
}
