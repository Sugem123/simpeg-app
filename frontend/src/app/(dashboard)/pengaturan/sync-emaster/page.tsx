"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { emasterService, type EmasterSyncResult, type SyncType } from "@/services/emaster-service";
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
  Users,
  FileText,
  History,
  Zap,
} from "lucide-react";

interface SyncOption {
  type: SyncType;
  label: string;
  description: string;
  icon: React.ReactNode;
  endpoint: () => Promise<{ success: boolean; message: string; data: EmasterSyncResult | null }>;
  timeout: number;
}

export default function SyncEmasterPage() {
  const [results, setResults] = useState<Record<string, EmasterSyncResult | null>>({});
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [activeSync, setActiveSync] = useState<SyncType | null>(null);

  const syncOptions: SyncOption[] = [
    {
      type: "sync",
      label: "Sync Data Dasar",
      description: "Tarik 39 kolom data pegawai dari excel_pns.php (NIP, NIK, nama, golongan, jabatan, pendidikan)",
      icon: <Database className="size-4" />,
      endpoint: () => emasterService.sync(),
      timeout: 120000,
    },
    {
      type: "sync-batch",
      label: "Sync Data Tambahan",
      description: "Tarik 16 endpoint batch: NPWP, BPJS, KK, BUP, SK CPNS/PNS, kelas jabatan, data pasangan, diklat (790 rows)",
      icon: <Users className="size-4" />,
      endpoint: () => emasterService.syncBatch(),
      timeout: 180000,
    },
    {
      type: "sync-documents",
      label: "Download Dokumen",
      description: "Download 21 jenis dokumen per pegawai: foto, KTP, NPWP, KSK, KARPEG, BPJS, TASPEN, SK, dll (184MB, ~5 menit)",
      icon: <FileText className="size-4" />,
      endpoint: () => emasterService.syncDocuments(),
      timeout: 600000,
    },
    {
      type: "sync-details",
      label: "Sync Riwayat Lengkap",
      description: "Scrape 59 halaman detail pegawai untuk riwayat pangkat, jabatan, pendidikan, diklat (~1281 records, ~75 detik)",
      icon: <History className="size-4" />,
      endpoint: () => emasterService.syncDetails(),
      timeout: 300000,
    },
    {
      type: "sync-all",
      label: "FULL SYNC (Semua)",
      description: "Jalankan semua 4 fase secara berurutan: data dasar + data tambahan + dokumen + riwayat lengkap",
      icon: <Zap className="size-4" />,
      endpoint: () => emasterService.syncAll(),
      timeout: 900000,
    },
  ];

  const syncMutation = useMutation({
    mutationFn: async (option: SyncOption) => {
      setActiveSync(option.type);
      return await option.endpoint();
    },
    onSuccess: (response, option) => {
      if (response.success) {
        setResults((prev) => ({ ...prev, [option.type]: response.data }));
        setErrorMsg("");
        toast.add({ title: `${option.label} berhasil`, type: "success" });
      } else {
        setErrorMsg(response.message || "Sinkronisasi gagal.");
        toast.add({ title: `${option.label} gagal`, type: "error" });
      }
      setActiveSync(null);
    },
    onError: (error: unknown, option) => {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga.";
      setErrorMsg(`${option.label}: ${msg}`);
      setActiveSync(null);
      toast.add({ title: `${option.label} gagal`, type: "error" });
    },
  });

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
        <div className="relative flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CloudDownload className="size-5 text-amber-400" />
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              Sinkronisasi <span className="text-gold-gradient">eMaster BKD</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Migrasi data dan dokumen pegawai dari eMaster BKD Jatimprov ke SIMPEG.
          </p>
        </div>
      </motion.div>

      {/* Info Card */}
      <div className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-400" />
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>
              Sinkronisasi menghubungi server{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-amber-300">
                master.bkd.jatimprov.go.id
              </code>{" "}
              dengan autentikasi 2FA (TOTP).
            </p>
            <p className="text-xs">
              Pilih jenis sync di bawah. Untuk migrasi penuh, gunakan tombol{" "}
              <span className="text-amber-300">FULL SYNC</span>.
            </p>
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

      {/* Sync Options */}
      <div className="grid grid-cols-1 gap-4">
        {syncOptions.map((option, idx) => {
          const isActive = activeSync === option.type;
          const isAnyActive = activeSync !== null;
          const result = results[option.type];

          return (
            <motion.div
              key={option.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                      {option.icon}
                    </div>
                    <h3 className="font-heading text-base font-bold">{option.label}</h3>
                    {option.type === "sync-all" && (
                      <Badge variant="outline" className="border-amber-400/25 bg-amber-400/10 text-amber-300">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Button
                  className={`shrink-0 rounded-xl ${
                    option.type === "sync-all"
                      ? "bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:brightness-110"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                  onClick={() => syncMutation.mutate(option)}
                  disabled={isAnyActive}
                >
                  {isActive ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Menyinkronkan...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 size-4" />
                      Jalankan
                    </>
                  )}
                </Button>
              </div>

              {/* Per-option result */}
              {result && !isActive && (
                <div className="mt-4 border-t border-white/5 pt-4">
                  <SyncResultDisplay result={result} type={option.type} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Active loading indicator */}
      {activeSync && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="size-8 animate-spin text-amber-400" />
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium text-muted-foreground">
              Menyinkronkan: {syncOptions.find((o) => o.type === activeSync)?.label}
            </span>
            <span className="text-xs text-muted-foreground/70">
              Menghubungi server eMaster BKD, mohon tunggu...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sync Result Display ───────────────────────────────────────

function SyncResultDisplay({ result, type }: { result: EmasterSyncResult; type: SyncType }) {
  const stats: { label: string; value: number | undefined }[] = [];

  if (type === "sync") {
    stats.push(
      { label: "Total Ditarik", value: result.total_fetched },
      { label: "Dibuat Baru", value: result.created },
      { label: "Diupdate", value: result.updated },
      { label: "Skipped", value: result.skipped },
    );
  } else if (type === "sync-batch") {
    stats.push(
      { label: "Pegawai Updated", value: result.pegawai_updated },
      { label: "Diklat Created", value: result.diklat_created },
    );
  } else if (type === "sync-documents") {
    stats.push(
      { label: "Foto Download", value: result.photos_downloaded },
      { label: "Dokumen Download", value: result.documents_downloaded },
      { label: "Skipped", value: result.skipped },
    );
  } else if (type === "sync-details") {
    stats.push(
      { label: "Pangkat", value: result.pangkat_created },
      { label: "Jabatan", value: result.jabatan_created },
      { label: "Pendidikan", value: result.pendidikan_created },
      { label: "Diklat", value: result.diklat_created },
    );
  } else if (type === "sync-all") {
    // Show all phase results
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-300">Full sync selesai</span>
        </div>
        {result.basic && <SyncResultDisplay result={result.basic} type="sync" />}
        {result.batch && <SyncResultDisplay result={result.batch} type="sync-batch" />}
        {result.documents && <SyncResultDisplay result={result.documents} type="sync-documents" />}
        {result.details && <SyncResultDisplay result={result.details} type="sync-details" />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-emerald-400" />
        <span className="text-sm font-medium text-emerald-300">Selesai</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <p className="font-heading text-lg font-bold">{stat.value ?? 0}</p>
          </div>
        ))}
      </div>
      {result.errors && result.errors.length > 0 && (
        <div className="rounded-lg border border-orange-400/20 bg-orange-400/5 p-3">
          <div className="mb-1 flex items-center gap-2">
            <AlertTriangle className="size-3.5 text-orange-400" />
            <span className="text-xs font-medium text-orange-300">
              Error ({result.errors.length})
            </span>
          </div>
          <div className="max-h-32 overflow-y-auto">
            <ul className="flex flex-col gap-1">
              {result.errors.slice(0, 10).map((err, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  <XCircle className="mr-1 inline size-3 text-red-400/70" />
                  <span className="font-mono">{err}</span>
                </li>
              ))}
              {result.errors.length > 10 && (
                <li className="text-xs text-muted-foreground/60">
                  ... dan {result.errors.length - 10} error lainnya
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
