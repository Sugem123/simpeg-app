"use client";
import { PreviewDokumenDialog } from "@/components/dokumen/preview-dokumen-dialog";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pegawaiService } from "@/services/pegawai-service";
import { dokumenService } from "@/services/dokumen-service";
import { riwayatService } from "@/services/riwayat-service";
import { masterService } from "@/services/master-service";
import { usePermission } from "@/hooks/use-permission";
import { toast } from "@/components/ui/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Pencil,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Eye,
  Upload,
  Plus,
  Briefcase,
  GraduationCap,
  TrendingUp,
  ArrowRightLeft,
  BookOpen,
  AlertTriangle,
  FolderOpen,
  Clock,
  User,
  Hash,
  CreditCard,
  Building,
  Shield,
  Loader2,
  Trash2,
} from "lucide-react";
import type {
  Pegawai,
  Dokumen,
  RiwayatJabatan,
  RiwayatPangkat,
  RiwayatPendidikan,
  RiwayatKgb,
  RiwayatDiklat,
  RiwayatMutasi,
  KategoriDokumen,
} from "@/types";
import { KATEGORI_DOKUMEN_LABEL } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Sub-components ─────────────────────────────────────────────

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium break-words">{value || "-"}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-xl" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────

function OverviewTab({
  pegawai,
  dokumenCount,
  riwayatCount,
}: {
  pegawai: Pegawai;
  dokumenCount: number;
  riwayatCount: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/20">
              <FileText className="size-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{dokumenCount}</p>
              <p className="text-xs text-muted-foreground">Dokumen</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
              <Clock className="size-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{riwayatCount}</p>
              <p className="text-xs text-muted-foreground">Riwayat</p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3 pt-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/20">
              <Calendar className="size-5 text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {pegawai.created_at
                  ? new Date(pegawai.created_at).getFullYear()
                  : "-"}
              </p>
              <p className="text-xs text-muted-foreground">Terdaftar</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identitas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4" />
              Identitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 sm:grid-cols-2">
              <InfoItem label="NIK" value={pegawai.nik} icon={CreditCard} />
              <InfoItem label="NIP" value={pegawai.nip} icon={Hash} />
              <InfoItem label="NUPTK" value={pegawai.nuptk} icon={Hash} />
              <InfoItem
                label="Tempat, Tanggal Lahir"
                value={`${pegawai.tempat_lahir}, ${formatDate(pegawai.tanggal_lahir)}`}
                icon={Calendar}
              />
              <InfoItem
                label="Jenis Kelamin"
                value={pegawai.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
              />
              <InfoItem
                label="Agama"
                value={pegawai.agama?.nama}
              />
              <InfoItem label="Email" value={pegawai.email} icon={Mail} />
              <InfoItem label="No. HP" value={pegawai.no_hp} icon={Phone} />
            </div>
            {pegawai.alamat && (
              <InfoItem label="Alamat" value={pegawai.alamat} icon={MapPin} />
            )}
          </CardContent>
        </Card>

        {/* Kepegawaian */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-4" />
              Kepegawaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1 sm:grid-cols-2">
              <InfoItem
                label="Status Kepegawaian"
                value={
                  pegawai.status_kepegawaian?.nama ? (
                    <Badge variant="default" className="mt-0.5">
                      {pegawai.status_kepegawaian.nama}
                    </Badge>
                  ) : (
                    "-"
                  )
                }
                icon={Shield}
              />
              <InfoItem
                label="Jenis Pegawai"
                value={pegawai.jenis_pegawai?.nama}
              />
              <InfoItem
                label="Jabatan"
                value={pegawai.jabatan?.nama}
                icon={Briefcase}
              />
              <InfoItem
                label="Pangkat"
                value={pegawai.pangkat?.nama}
                icon={TrendingUp}
              />
              <InfoItem
                label="Golongan"
                value={pegawai.golongan?.nama}
              />
              <InfoItem
                label="Unit Kerja"
                value={pegawai.unit_kerja?.nama}
                icon={Building}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Identitas Tab ──────────────────────────────────────────────

function IdentitasTab({ pegawai }: { pegawai: Pegawai }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Identitas Lengkap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <InfoItem label="Nama Lengkap" value={pegawai.nama_lengkap ?? pegawai.nama} icon={User} />
          <InfoItem label="Gelar Depan" value={pegawai.gelar_depan} />
          <InfoItem label="Gelar Belakang" value={pegawai.gelar_belakang} />
          <InfoItem label="NIK" value={pegawai.nik} icon={CreditCard} />
          <InfoItem label="NIP" value={pegawai.nip} icon={Hash} />
          <InfoItem label="NUPTK" value={pegawai.nuptk} icon={Hash} />
          <InfoItem
            label="Tempat Lahir"
            value={pegawai.tempat_lahir}
            icon={MapPin}
          />
          <InfoItem
            label="Tanggal Lahir"
            value={formatDate(pegawai.tanggal_lahir)}
            icon={Calendar}
          />
          <InfoItem
            label="Jenis Kelamin"
            value={pegawai.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          />
          <InfoItem label="Agama" value={pegawai.agama?.nama} />
          <InfoItem label="Email" value={pegawai.email} icon={Mail} />
          <InfoItem label="No. HP" value={pegawai.no_hp} icon={Phone} />
        </div>
        <Separator className="my-4" />
        <InfoItem label="Alamat Lengkap" value={pegawai.alamat} icon={MapPin} />
      </CardContent>
    </Card>
  );
}

// ─── Kepegawaian Tab ────────────────────────────────────────────

function KepegawaianTab({
  pegawai,
  riwayatJabatan,
  isLoadingRiwayat,
}: {
  pegawai: Pegawai;
  riwayatJabatan: RiwayatJabatan[];
  isLoadingRiwayat: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kepegawaian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <InfoItem
              label="Status Kepegawaian"
              value={pegawai.status_kepegawaian?.nama}
              icon={Shield}
            />
            <InfoItem
              label="Jenis Pegawai"
              value={pegawai.jenis_pegawai?.nama}
            />
            <InfoItem
              label="Jabatan"
              value={pegawai.jabatan?.nama}
              icon={Briefcase}
            />
            <InfoItem
              label="Pangkat"
              value={pegawai.pangkat?.nama}
              icon={TrendingUp}
            />
            <InfoItem
              label="Golongan"
              value={pegawai.golongan?.nama}
            />
            <InfoItem
              label="Unit Kerja"
              value={pegawai.unit_kerja?.nama}
              icon={Building}
            />
            <InfoItem
              label="Status Aktif"
              value={
                <Badge variant={pegawai.status_aktif ? "default" : "secondary"}>
                  {pegawai.status_aktif ? "Aktif" : "Nonaktif"}
                </Badge>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Riwayat Jabatan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-4" />
            Riwayat Jabatan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRiwayat ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : riwayatJabatan.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Briefcase className="size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Belum ada riwayat jabatan
              </p>
            </div>
          ) : (
            <div className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {riwayatJabatan.map((rj) => (
                <div key={rj.id} className="relative">
                  <div className="absolute -left-6 top-1.5 size-3 rounded-full border-2 border-blue-600 bg-background" />
                  <div className="rounded-xl border p-3">
                    <p className="font-medium">{rj.jabatan?.nama ?? "-"}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>TMT: {formatDate(rj.tmt)}</span>
                      {rj.nomor_sk && <span>SK: {rj.nomor_sk}</span>}
                      {rj.tanggal_sk && (
                        <span>Tgl SK: {formatDate(rj.tanggal_sk)}</span>
                      )}
                    </div>
                    {rj.keterangan && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {rj.keterangan}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Dokumen Tab ────────────────────────────────────────────────

function DokumenTab({
  pegawaiId,
}: {
  pegawaiId: string;
}) {
  const queryClient = useQueryClient();
  const { canManagePegawai, isIndividuOnly } = usePermission();
  const canUpload = canManagePegawai() || isIndividuOnly();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDok, setPreviewDok] = useState<Dokumen | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dokumen", pegawaiId],
    queryFn: () => dokumenService.getByPegawai(pegawaiId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dokumenService.delete(id),
    onSuccess: () => {
      toast.add({ title: "Dokumen berhasil dihapus", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["dokumen", pegawaiId] });
    },
    onError: () => {
      toast.add({ title: "Gagal menghapus dokumen", type: "error" });
    },
  });

  const dokumenList = data?.data ?? [];

  // Group by kategori
  const grouped = dokumenList.reduce(
    (acc, dok) => {
      const key = dok.kategori;
      if (!acc[key]) acc[key] = [];
      acc[key].push(dok);
      return acc;
    },
    {} as Record<KategoriDokumen, Dokumen[]>
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="size-10 text-destructive/60" />
        <p className="text-sm text-muted-foreground">
          Gagal memuat data dokumen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Dokumen ({dokumenList.length})
        </h3>
        {canUpload && (
          <Button className="rounded-xl" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 size-4" />
            Upload Dokumen
          </Button>
        )}
      </div>

      <UploadDokumenDialog
        pegawaiId={pegawaiId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <PreviewDokumenDialog
        dok={previewDok}
        open={!!previewDok}
        onOpenChange={(open) => !open && setPreviewDok(null)}
      />

      {dokumenList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FolderOpen className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Belum ada dokumen
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Upload dokumen pegawai untuk memulai
            </p>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([kategori, docs]) => (
          <div key={kategori}>
            <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {KATEGORI_DOKUMEN_LABEL[kategori as KategoriDokumen] ?? kategori}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((dok) => (
                <Card key={dok.id} size="sm">
                  <CardContent className="flex flex-col gap-2 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Badge variant="secondary" className="mb-1.5 text-xs">
                          {KATEGORI_DOKUMEN_LABEL[dok.kategori]}
                        </Badge>
                        <p
                          className="truncate text-sm font-medium hover:underline cursor-pointer"
                          onClick={() => setPreviewDok(dok)}
                          title="Klik untuk pratinjau"
                        >
                          {dok.nama_file}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setPreviewDok(dok)}
                          title="Pratinjau Dokumen"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <a
                          href={dokumenService.getDownloadUrl(dok.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon-sm" title="Unduh">
                            <Download className="size-4" />
                          </Button>
                        </a>
                        {canUpload && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(dok.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(dok.created_at)}</span>
                      <span>{formatFileSize(dok.ukuran)}</span>
                    </div>
                    {dok.keterangan && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {dok.keterangan}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Riwayat Tab ────────────────────────────────────────────────

type RiwayatSubTab = "jabatan" | "pangkat" | "pendidikan" | "kgb" | "diklat" | "mutasi";

const RIWAYAT_SUB_TABS: { value: RiwayatSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "jabatan", label: "Jabatan", icon: Briefcase },
  { value: "pangkat", label: "Pangkat", icon: TrendingUp },
  { value: "pendidikan", label: "Pendidikan", icon: GraduationCap },
  { value: "kgb", label: "KGB", icon: TrendingUp },
  { value: "diklat", label: "Diklat", icon: BookOpen },
  { value: "mutasi", label: "Mutasi", icon: ArrowRightLeft },
];

function RiwayatTab({ pegawaiId }: { pegawaiId: string }) {
  const [activeSubTab, setActiveSubTab] = useState<RiwayatSubTab>("jabatan");

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-tab navigation */}
      <div className="flex flex-wrap gap-2">
        {RIWAYAT_SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.value}
              variant={activeSubTab === tab.value ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              onClick={() => setActiveSubTab(tab.value)}
            >
              <Icon className="mr-1.5 size-3.5" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Sub-tab content */}
      <RiwayatSubContent pegawaiId={pegawaiId} type={activeSubTab} />
    </div>
  );
}

function RiwayatSubContent({
  pegawaiId,
  type,
}: {
  pegawaiId: string;
  type: RiwayatSubTab;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const { canManagePegawai, isIndividuOnly } = usePermission();
  const canAdd = canManagePegawai() || isIndividuOnly();

  const { data, isLoading, error } = useQuery({
    queryKey: ["riwayat", pegawaiId, type],
    queryFn: () => riwayatService.getByPegawai(pegawaiId, type),
  });

  const items = (data?.data ?? []) as Record<string, unknown>[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertTriangle className="size-8 text-destructive/60" />
        <p className="text-sm text-muted-foreground">Gagal memuat riwayat.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Clock className="size-8 text-muted-foreground/40" />
        <div>
          <p className="font-medium text-muted-foreground">
            Belum ada riwayat {RIWAYAT_SUB_TABS.find((t) => t.value === type)?.label.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Tambahkan riwayat baru untuk memulai
          </p>
        </div>
        {canAdd && (
          <Button
            variant="outline"
            className="mt-2 rounded-xl"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            Tambah Riwayat
          </Button>
        )}
        <TambahRiwayatDialog
          pegawaiId={pegawaiId}
          type={type}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {canAdd && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            className="rounded-xl"
            size="sm"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="mr-1.5 size-3.5" />
            Tambah
          </Button>
        </div>
      )}
      <RiwayatTable type={type} items={items} />
      <TambahRiwayatDialog
        pegawaiId={pegawaiId}
        type={type}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}

function RiwayatTable({
  type,
  items,
}: {
  type: RiwayatSubTab;
  items: Record<string, unknown>[];
}) {
  switch (type) {
    case "jabatan":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jabatan</TableHead>
                  <TableHead>TMT</TableHead>
                  <TableHead className="hidden sm:table-cell">No. SK</TableHead>
                  <TableHead className="hidden md:table-cell">Tgl SK</TableHead>
                  <TableHead className="hidden lg:table-cell">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatJabatan[]).map((rj) => (
                  <TableRow key={rj.id}>
                    <TableCell className="font-medium">
                      {rj.jabatan?.nama ?? "-"}
                    </TableCell>
                    <TableCell>{formatDate(rj.tmt)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rj.nomor_sk ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(rj.tanggal_sk)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {rj.keterangan ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    case "pangkat":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pangkat</TableHead>
                  <TableHead>Golongan</TableHead>
                  <TableHead>TMT</TableHead>
                  <TableHead className="hidden sm:table-cell">No. SK</TableHead>
                  <TableHead className="hidden md:table-cell">Tgl SK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatPangkat[]).map((rp) => (
                  <TableRow key={rp.id}>
                    <TableCell className="font-medium">
                      {rp.pangkat?.nama ?? "-"}
                    </TableCell>
                    <TableCell>{rp.golongan?.nama ?? "-"}</TableCell>
                    <TableCell>{formatDate(rp.tmt)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rp.nomor_sk ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(rp.tanggal_sk)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    case "pendidikan":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenjang</TableHead>
                  <TableHead>Institusi</TableHead>
                  <TableHead className="hidden sm:table-cell">Jurusan</TableHead>
                  <TableHead>Tahun Lulus</TableHead>
                  <TableHead className="hidden md:table-cell">No. Ijazah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatPendidikan[]).map((rp) => (
                  <TableRow key={rp.id}>
                    <TableCell className="font-medium">{rp.jenjang}</TableCell>
                    <TableCell>{rp.institusi}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rp.jurusan ?? "-"}
                    </TableCell>
                    <TableCell>{rp.tahun_lulus}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {rp.nomor_ijazah ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    case "kgb":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TMT</TableHead>
                  <TableHead className="hidden sm:table-cell">No. SK</TableHead>
                  <TableHead className="hidden sm:table-cell">Tgl SK</TableHead>
                  <TableHead>Gaji Lama</TableHead>
                  <TableHead>Gaji Baru</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatKgb[]).map((rk) => (
                  <TableRow key={rk.id}>
                    <TableCell className="font-medium">
                      {formatDate(rk.tmt)}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rk.nomor_sk ?? "-"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatDate(rk.tanggal_sk)}
                    </TableCell>
                    <TableCell>
                      {rk.gaji_pokok_lama
                        ? `Rp ${rk.gaji_pokok_lama.toLocaleString("id-ID")}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {rk.gaji_pokok_baru
                        ? `Rp ${rk.gaji_pokok_baru.toLocaleString("id-ID")}`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    case "diklat":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Diklat</TableHead>
                  <TableHead className="hidden sm:table-cell">Penyelenggara</TableHead>
                  <TableHead>Tahun</TableHead>
                  <TableHead className="hidden md:table-cell">JP</TableHead>
                  <TableHead className="hidden lg:table-cell">No. Sertifikat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatDiklat[]).map((rd) => (
                  <TableRow key={rd.id}>
                    <TableCell className="font-medium">
                      {rd.nama_diklat}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rd.penyelenggara ?? "-"}
                    </TableCell>
                    <TableCell>{rd.tahun ?? "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {rd.jam_pelajaran ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {rd.nomor_sertifikat ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    case "mutasi":
      return (
        <div className="rounded-2xl border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asal</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>TMT</TableHead>
                  <TableHead className="hidden sm:table-cell">No. SK</TableHead>
                  <TableHead className="hidden md:table-cell">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items as unknown as RiwayatMutasi[]).map((rm) => (
                  <TableRow key={rm.id}>
                    <TableCell>{rm.asal}</TableCell>
                    <TableCell className="font-medium">{rm.tujuan}</TableCell>
                    <TableCell>{formatDate(rm.tmt)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {rm.nomor_sk ?? "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {rm.keterangan ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Dialog Helpers ─────────────────────────────────────────────

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response;
    if (resp?.data?.message) return resp.data.message;
    if (resp?.data?.errors) {
      const first = Object.values(resp.data.errors).flat()[0];
      if (first) return first;
    }
  }
  return "Terjadi kesalahan tidak terduga";
}

// ─── Upload Dokumen Dialog ──────────────────────────────────────

function UploadDokumenDialog({
  pegawaiId,
  open,
  onOpenChange,
}: {
  pegawaiId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kategori, setKategori] = useState<KategoriDokumen>("ktp");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("File dokumen wajib dipilih.");
      const fd = new FormData();
      fd.append("pegawai_id", pegawaiId);
      fd.append("kategori", kategori);
      fd.append("file", file);
      if (keterangan.trim()) fd.append("keterangan", keterangan.trim());
      return dokumenService.upload(pegawaiId, fd);
    },
    onSuccess: () => {
      toast.add({ title: "Dokumen berhasil diunggah", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["dokumen", pegawaiId] });
      reset();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.add({ title: extractErrorMessage(err), type: "error" });
    },
  });

  const reset = () => {
    setKategori("ktp");
    setKeterangan("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Dokumen</DialogTitle>
          <DialogDescription>
            Unggah dokumen kepegawaian (maks. 10MB — PDF, JPG, PNG, DOC).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Kategori</Label>
            <Select
              value={kategori}
              onValueChange={(v) => setKategori((v as KategoriDokumen) ?? "ktp")}
              items={KATEGORI_DOKUMEN_LABEL}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(KATEGORI_DOKUMEN_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>File</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Keterangan (opsional)</Label>
            <Textarea
              rows={3}
              className="rounded-xl"
              placeholder="Keterangan tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending || !file}
          >
            {uploadMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {uploadMutation.isPending ? "Mengunggah..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tambah Riwayat Dialog ──────────────────────────────────────

type RiwayatFieldDef = {
  name: string;
  label: string;
  input: "text" | "date" | "number" | "textarea" | "select";
  required?: boolean;
  master?: "jabatan" | "pangkat" | "golongan";
  options?: { value: string; label: string }[];
};

const JENJANG_OPTIONS = ["SD", "SMP", "SMA", "SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"].map(
  (j) => ({ value: j, label: j })
);

const RIWAYAT_FIELDS: Record<RiwayatSubTab, RiwayatFieldDef[]> = {
  jabatan: [
    { name: "jabatan_id", label: "Jabatan", input: "select", required: true, master: "jabatan" },
    { name: "tmt", label: "TMT", input: "date", required: true },
    { name: "nomor_sk", label: "Nomor SK", input: "text" },
    { name: "tanggal_sk", label: "Tanggal SK", input: "date" },
    { name: "keterangan", label: "Keterangan", input: "textarea" },
  ],
  pangkat: [
    { name: "pangkat_id", label: "Pangkat", input: "select", required: true, master: "pangkat" },
    { name: "golongan_id", label: "Golongan", input: "select", master: "golongan" },
    { name: "nomor_sk", label: "Nomor SK", input: "text" },
    { name: "tanggal_sk", label: "Tanggal SK", input: "date" },
    { name: "tmt", label: "TMT", input: "date" },
  ],
  pendidikan: [
    { name: "jenjang", label: "Jenjang", input: "select", required: true, options: JENJANG_OPTIONS },
    { name: "institusi", label: "Institusi", input: "text", required: true },
    { name: "jurusan", label: "Jurusan", input: "text" },
    { name: "tahun_lulus", label: "Tahun Lulus", input: "number" },
    { name: "nomor_ijazah", label: "Nomor Ijazah", input: "text" },
  ],
  kgb: [
    { name: "nomor_sk", label: "Nomor SK", input: "text" },
    { name: "tanggal_sk", label: "Tanggal SK", input: "date" },
    { name: "tmt", label: "TMT", input: "date" },
    { name: "gaji_pokok_lama", label: "Gaji Pokok Lama", input: "number" },
    { name: "gaji_pokok_baru", label: "Gaji Pokok Baru", input: "number" },
  ],
  diklat: [
    { name: "nama_diklat", label: "Nama Diklat", input: "text", required: true },
    { name: "penyelenggara", label: "Penyelenggara", input: "text" },
    { name: "tahun", label: "Tahun", input: "number" },
    { name: "jam_pelajaran", label: "Jam Pelajaran", input: "number" },
    { name: "nomor_sertifikat", label: "Nomor Sertifikat", input: "text" },
  ],
  mutasi: [
    { name: "asal", label: "Asal", input: "text", required: true },
    { name: "tujuan", label: "Tujuan", input: "text", required: true },
    { name: "nomor_sk", label: "Nomor SK", input: "text" },
    { name: "tanggal_sk", label: "Tanggal SK", input: "date" },
    { name: "tmt", label: "TMT", input: "date" },
    { name: "keterangan", label: "Keterangan", input: "textarea" },
  ],
};

function TambahRiwayatDialog({
  pegawaiId,
  type,
  open,
  onOpenChange,
}: {
  pegawaiId: string;
  type: RiwayatSubTab;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});

  const fields = RIWAYAT_FIELDS[type];
  const typeLabel =
    RIWAYAT_SUB_TABS.find((t) => t.value === type)?.label ?? type;

  const { data: jabatanData } = useQuery({
    queryKey: ["master", "jabatan", "all"],
    queryFn: () => masterService.getAllMasterData("jabatan"),
    enabled: open && type === "jabatan",
    staleTime: 5 * 60 * 1000,
  });
  const { data: pangkatData } = useQuery({
    queryKey: ["master", "pangkat", "all"],
    queryFn: () => masterService.getAllMasterData("pangkat"),
    enabled: open && type === "pangkat",
    staleTime: 5 * 60 * 1000,
  });
  const { data: golonganData } = useQuery({
    queryKey: ["master", "golongan", "all"],
    queryFn: () => masterService.getAllMasterData("golongan"),
    enabled: open && type === "pangkat",
    staleTime: 5 * 60 * 1000,
  });

  const masterOptions = (master: RiwayatFieldDef["master"]) => {
    if (master === "jabatan") return jabatanData?.data ?? [];
    if (master === "pangkat") return pangkatData?.data ?? [];
    if (master === "golongan") return golonganData?.data ?? [];
    return [];
  };

  const setField = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const buildPayload = (): Record<string, unknown> => {
    const payload: Record<string, unknown> = { pegawai_id: pegawaiId };
    for (const f of fields) {
      const raw = form[f.name] ?? "";
      if (raw === "") continue;
      payload[f.name] = f.input === "number" ? Number(raw) : raw;
    }
    return payload;
  };

  const requiredFilled = fields
    .filter((f) => f.required)
    .every((f) => (form[f.name] ?? "").trim() !== "");

  const createMutation = useMutation({
    mutationFn: () => riwayatService.create(pegawaiId, type, buildPayload()),
    onSuccess: () => {
      toast.add({ title: `Riwayat ${typeLabel.toLowerCase()} berhasil ditambahkan`, type: "success" });
      queryClient.invalidateQueries({ queryKey: ["riwayat", pegawaiId, type] });
      setForm({});
      onOpenChange(false);
    },
    onError: (err) => {
      toast.add({ title: extractErrorMessage(err), type: "error" });
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setForm({});
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Riwayat {typeLabel}</DialogTitle>
          <DialogDescription>
            Lengkapi data riwayat {typeLabel.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2">
          {fields.map((f) => (
            <div key={f.name} className="flex flex-col gap-2">
              <Label>
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </Label>

              {f.input === "textarea" ? (
                <Textarea
                  rows={3}
                  className="rounded-xl"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              ) : f.input === "select" ? (
                <Select
                  value={form[f.name] || undefined}
                  onValueChange={(v) => setField(f.name, v ?? "")}
                  items={Object.fromEntries(
                    (f.master
                      ? masterOptions(f.master).map((m) => [m.id, m.nama])
                      : (f.options ?? []).map((o) => [o.value, o.label])) as [string, string][]
                  )}
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder={`Pilih ${f.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.master
                      ? masterOptions(f.master).map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.nama}
                          </SelectItem>
                        ))
                      : (f.options ?? []).map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.input === "date" ? "date" : f.input === "number" ? "number" : "text"}
                  className="rounded-xl"
                  value={form[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || !requiredFilled}
          >
            {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page Component ────────────────────────────────────────

export default function PegawaiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { canManagePegawai, isIndividuOnly } = usePermission();
  const canManage = canManagePegawai();
  const individuOnly = isIndividuOnly();
  // Individu may edit their own record; admins may edit any record.
  const canEdit = canManage || individuOnly;
  const backHref = individuOnly ? "/dashboard" : "/pegawai";
  const backLabel = individuOnly ? "Kembali ke Dashboard" : "Kembali ke Daftar Pegawai";

  // Fetch pegawai data
  const {
    data: pegawaiData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pegawai", id],
    queryFn: () => pegawaiService.getPegawaiById(id),
    enabled: !!id,
  });

  // Fetch riwayat jabatan for kepegawaian tab
  const { data: riwayatJabatanData, isLoading: isLoadingRiwayatJabatan } =
    useQuery({
      queryKey: ["riwayat", id, "jabatan"],
      queryFn: () =>
        riwayatService.getByPegawai<RiwayatJabatan>(id, "jabatan"),
      enabled: !!id,
    });

  // Fetch dokumen count for overview
  const { data: dokumenData } = useQuery({
    queryKey: ["dokumen", id],
    queryFn: () => dokumenService.getByPegawai(id),
    enabled: !!id,
  });

  const pegawai = pegawaiData?.data;
  const riwayatJabatan = riwayatJabatanData?.data ?? [];
  const dokumenCount = dokumenData?.data?.length ?? 0;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !pegawai) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <AlertTriangle className="size-12 text-destructive/60" />
        <div>
          <h2 className="text-lg font-semibold">Data Tidak Ditemukan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pegawai dengan ID tersebut tidak ditemukan atau terjadi kesalahan.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(backHref)}
        >
          <ArrowLeft className="mr-2 size-4" />
          {backLabel}
        </Button>
      </div>
    );
  }

  const displayName = pegawai.nama_lengkap ?? pegawai.nama;

  return (
    <div className="flex flex-col gap-6">
      {/* Back Button */}
      <Link
        href={backHref}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="size-16 sm:size-20" size="lg">
              {pegawai.foto ? (
                <AvatarImage src={pegawai.foto} alt={displayName} />
              ) : null}
              <AvatarFallback className="text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {displayName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {pegawai.nip && (
                  <span className="font-mono">NIP: {pegawai.nip}</span>
                )}
                <Badge
                  variant={pegawai.status_aktif ? "default" : "secondary"}
                >
                  {pegawai.status_aktif ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {pegawai.jabatan?.nama && <span>{pegawai.jabatan.nama}</span>}
                {pegawai.unit_kerja?.nama && (
                  <>
                    <span className="text-muted-foreground/40">|</span>
                    <span>{pegawai.unit_kerja.nama}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:flex-col">
            {canEdit && (
              <Link href={`/pegawai/${id}/edit`}>
                <Button variant="outline" className="w-full rounded-xl">
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Button>
              </Link>
            )}
            {canManage && (
              <Button
                variant="destructive"
                className="rounded-xl"
              >
                <UserX className="mr-2 size-4" />
                Nonaktifkan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identitas">Identitas</TabsTrigger>
          <TabsTrigger value="kepegawaian">Kepegawaian</TabsTrigger>
          <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab
            pegawai={pegawai}
            dokumenCount={dokumenCount}
            riwayatCount={riwayatJabatan.length}
          />
        </TabsContent>

        <TabsContent value="identitas" className="mt-6">
          <IdentitasTab pegawai={pegawai} />
        </TabsContent>

        <TabsContent value="kepegawaian" className="mt-6">
          <KepegawaianTab
            pegawai={pegawai}
            riwayatJabatan={riwayatJabatan}
            isLoadingRiwayat={isLoadingRiwayatJabatan}
          />
        </TabsContent>

        <TabsContent value="dokumen" className="mt-6">
          <DokumenTab pegawaiId={id} />
        </TabsContent>

        <TabsContent value="riwayat" className="mt-6">
          <RiwayatTab pegawaiId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
