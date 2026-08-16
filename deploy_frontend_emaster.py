import os

base = '/home/dhonawid/simpeg-app/frontend/src'

# ─── 1. emaster-service.ts ─────────────────────────────────────
service_content = '''import { post } from "@/lib/api";

export interface EmasterSyncResult {
  created: number;
  updated: number;
  skipped: number;
  total_fetched: number;
  errors: string[];
}

export interface EmasterSyncResponse {
  success: boolean;
  message: string;
  data: EmasterSyncResult | null;
}

export const emasterService = {
  sync() {
    return post<EmasterSyncResponse>("/emaster/sync", {});
  },
};
'''

with open(os.path.join(base, 'services', 'emaster-service.ts'), 'w') as f:
    f.write(service_content)
print('WROTE: services/emaster-service.ts')

# ─── 2. sync-emaster page ──────────────────────────────────────
page_content = '''"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { emasterService, type EmasterSyncResult } from "@/services/emaster-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  CloudDownload,
  Info,
} from "lucide-react";

export default function SyncEmasterPage() {
  const [result, setResult] = useState<EmasterSyncResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const syncMutation = useMutation({
    mutationFn: () => emasterService.sync(),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setResult(response.data);
        setErrorMsg("");
        toast.add({
          title: "Sinkronisasi eMaster berhasil",
          type: "success",
        });
      } else {
        setErrorMsg(response.message || "Sinkronisasi gagal tanpa pesan error.");
        toast.add({
          title: "Sinkronisasi eMaster gagal",
          type: "error",
        });
      }
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tidak terduga saat sinkronisasi.";
      setErrorMsg(msg);
      setResult(null);
      toast.add({ title: "Sinkronisasi eMaster gagal", type: "error" });
    },
  });

  const isLoading = syncMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/8 blur-[80px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CloudDownload className="size-5 text-amber-400" />
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Sinkronisasi <span className="text-gold-gradient">eMaster BKD</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Tarik dan sinkronkan data pegawai dari eMaster BKD Jatimprov ke SIMPEG.
            </p>
          </div>
          <Button
            className="rounded-xl bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:brightness-110"
            onClick={() => syncMutation.mutate()}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyinkronkan...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                Mulai Sinkronisasi
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Info Card */}
      <div className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-400" />
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Sinkronisasi akan menghubungi server{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-300">
                master.bkd.jatimprov.go.id
              </code>{" "}
              dan menarik data pegawai PNS/PPPK untuk SKPD SMAN 1 Prambon.
            </p>
            <ul className="ml-4 flex flex-col gap-1 text-xs">
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-amber-400" />
                Pegawai baru akan dibuat berdasarkan NIK
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-amber-400" />
                Pegawai existing akan diupdate data terbarunya
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-amber-400" />
                Riwayat pangkat, jabatan, dan pendidikan dibuat untuk pegawai baru
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-amber-400" />
                Proses ini membutuhkan autentikasi 2FA (TOTP) ke eMaster
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-5">
          <XCircle className="mt-0.5 size-5 shrink-0 text-red-400" />
          <div className="flex flex-col gap-1">
            <span className="font-medium text-red-300">Sinkronisasi Gagal</span>
            <span className="text-sm text-red-300/80">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-400" />
            <h2 className="font-heading text-lg font-bold">Hasil Sinkronisasi</h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Ditarik"
              value={result.total_fetched}
              icon={<Database className="size-4 text-blue-400" />}
              color="blue"
            />
            <StatCard
              label="Dibuat Baru"
              value={result.created}
              icon={<CheckCircle2 className="size-4 text-emerald-400" />}
              color="emerald"
            />
            <StatCard
              label="Diupdate"
              value={result.updated}
              icon={<RefreshCw className="size-4 text-amber-400" />}
              color="amber"
            />
            <StatCard
              label="Skipped"
              value={result.skipped}
              icon={<AlertTriangle className="size-4 text-orange-400" />}
              color="orange"
            />
          </div>

          {/* Errors List */}
          {result.errors.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="size-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-300">
                  Detail Error ({result.errors.length})
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <ul className="flex flex-col gap-1.5">
                  {result.errors.map((err, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground"
                    >
                      <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-400/70" />
                      <span className="font-mono">{err}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Success Badge */}
          {result.errors.length === 0 && result.skipped === 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              >
                Semua data berhasil disinkronkan tanpa error
              </Badge>
            </div>
          )}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && !result && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader2 className="size-8 animate-spin text-amber-400" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium text-muted-foreground">
              Menghubungi server eMaster BKD...
            </span>
            <span className="text-xs text-muted-foreground/70">
              Login dengan 2FA, menarik data, dan menyinkronkan pegawai
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card Component ───────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber" | "orange";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "border-blue-400/15 bg-blue-400/[0.05]",
    emerald: "border-emerald-400/15 bg-emerald-400/[0.05]",
    amber: "border-amber-400/15 bg-amber-400/[0.05]",
    orange: "border-orange-400/15 bg-orange-400/[0.05]",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${colorClasses[color]}`}>
      <div className="mb-1 flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
'''

page_dir = os.path.join(base, 'app', '(dashboard)', 'pengaturan', 'sync-emaster')
os.makedirs(page_dir, exist_ok=True)
with open(os.path.join(page_dir, 'page.tsx'), 'w') as f:
    f.write(page_content)
print('WROTE: app/(dashboard)/pengaturan/sync-emaster/page.tsx')

# ─── 3. Update sidebar.tsx to add nav link ─────────────────────
sidebar_path = os.path.join(base, 'components', 'layout', 'sidebar.tsx')
with open(sidebar_path, 'r') as f:
    sidebar = f.read()

if 'sync-emaster' not in sidebar:
    sidebar = sidebar.replace(
        '{ label: "Profil Sekolah", href: "/pengaturan/profil-sekolah" },',
        '{ label: "Profil Sekolah", href: "/pengaturan/profil-sekolah" },\n      { label: "Sync eMaster BKD", href: "/pengaturan/sync-emaster" },'
    )
    with open(sidebar_path, 'w') as f:
        f.write(sidebar)
    print('UPDATED: components/layout/sidebar.tsx (added sync-emaster nav link)')
else:
    print('SKIPPED: sidebar already has sync-emaster link')

print('\nALL_FRONTEND_FILES_DONE')
