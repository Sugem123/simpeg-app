"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cutiService } from "@/services/cuti-service";
import { usePermission } from "@/hooks/use-permission";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Eye,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CalendarOff,
} from "lucide-react";
import type {
  Cuti,
  CutiQueryParams,
  JenisCuti,
  StatusCuti,
} from "@/types";
import {
  JENIS_CUTI_LABEL,
  STATUS_CUTI_LABEL,
  STATUS_CUTI_COLOR,
} from "@/types";

const JENIS_CUTI_OPTIONS = Object.entries(JENIS_CUTI_LABEL) as [
  JenisCuti,
  string,
][];

const STATUS_FILTER_OPTIONS: { value: StatusCuti | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "menunggu", label: "Menunggu" },
  { value: "disetujui", label: "Disetujui" },
  { value: "ditolak", label: "Ditolak" },
];

/** Map STATUS_CUTI_COLOR values to valid Badge variant props */
function getStatusBadgeVariant(
  status: StatusCuti
): "default" | "secondary" | "destructive" | "outline" {
  const color = STATUS_CUTI_COLOR[status];
  switch (color) {
    case "success":
      return "default";
    case "warning":
      return "outline";
    case "destructive":
      return "destructive";
    case "secondary":
    default:
      return "secondary";
  }
}

export default function CutiPage() {
  const queryClient = useQueryClient();
  const { isSuperAdmin, isFasilitator } = usePermission();
  const { user } = useAuth();
  const canApprove = isSuperAdmin() || isFasilitator();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusCuti | "">("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<Cuti | null>(null);
  const [approvalTarget, setApprovalTarget] = useState<Cuti | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [approvalNote, setApprovalNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Cuti | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    jenis_cuti: "" as JenisCuti | "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    alasan: "",
  });

  const params: CutiQueryParams = {
    page,
    per_page: perPage,
    status: statusFilter || undefined,
  };

  // Fetch cuti
  const { data, isLoading, error } = useQuery({
    queryKey: ["cuti", params],
    queryFn: () => cutiService.getAll(params),
    placeholderData: (prev) => prev,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Cuti>) => cutiService.create(data),
    onSuccess: () => {
      toast.add({ title: "Pengajuan cuti berhasil dibuat", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["cuti"] });
      resetCreateForm();
    },
    onError: () => {
      toast.add({ title: "Gagal membuat pengajuan cuti", type: "error" });
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan?: string }) =>
      cutiService.approve(id, catatan),
    onSuccess: () => {
      toast.add({ title: "Cuti berhasil disetujui", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["cuti"] });
      closeApprovalDialog();
    },
    onError: () => {
      toast.add({ title: "Gagal menyetujui cuti", type: "error" });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan: string }) =>
      cutiService.reject(id, catatan),
    onSuccess: () => {
      toast.add({ title: "Cuti berhasil ditolak", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["cuti"] });
      closeApprovalDialog();
    },
    onError: () => {
      toast.add({ title: "Gagal menolak cuti", type: "error" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => cutiService.delete(id),
    onSuccess: () => {
      toast.add({ title: "Pengajuan cuti berhasil dihapus", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["cuti"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.add({ title: "Gagal menghapus pengajuan cuti", type: "error" });
    },
  });

  const cutiList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  const resetCreateForm = () => {
    setCreateOpen(false);
    setCreateForm({
      jenis_cuti: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      alasan: "",
    });
  };

  const closeApprovalDialog = () => {
    setApprovalTarget(null);
    setApprovalNote("");
  };

  const openApprovalDialog = (cuti: Cuti, action: "approve" | "reject") => {
    setApprovalTarget(cuti);
    setApprovalAction(action);
    setApprovalNote("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.jenis_cuti ||
      !createForm.tanggal_mulai ||
      !createForm.tanggal_selesai ||
      !createForm.alasan
    ) {
      toast.add({ title: "Lengkapi semua field yang wajib", type: "error" });
      return;
    }
    createMutation.mutate({
      jenis_cuti: createForm.jenis_cuti as JenisCuti,
      tanggal_mulai: createForm.tanggal_mulai,
      tanggal_selesai: createForm.tanggal_selesai,
      alasan: createForm.alasan,
    });
  };

  const handleApprovalSubmit = () => {
    if (!approvalTarget) return;

    if (approvalAction === "approve") {
      approveMutation.mutate({
        id: approvalTarget.id,
        catatan: approvalNote || undefined,
      });
    } else {
      if (!approvalNote.trim()) {
        toast.add({
          title: "Catatan wajib diisi untuk penolakan",
          type: "error",
        });
        return;
      }
      rejectMutation.mutate({
        id: approvalTarget.id,
        catatan: approvalNote,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string, end: string) => {
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Pengajuan Cuti
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pengajuan cuti pegawai SMAN 1 Prambon
          </p>
        </div>
        <Button
          className="w-full rounded-xl sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Ajukan Cuti
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={statusFilter === option.value ? "default" : "outline"}
            size="sm"
            className="rounded-xl"
            onClick={() => {
              setStatusFilter(option.value);
              setPage(1);
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border bg-card">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="size-10 text-destructive/60" />
            <p className="text-sm text-muted-foreground">
              Gagal memuat data cuti. Periksa koneksi ke server.
            </p>
          </div>
        ) : cutiList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <CalendarOff className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">
                Belum ada data cuti
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                {statusFilter
                  ? "Tidak ada cuti dengan status ini"
                  : "Mulai dengan mengajukan cuti baru"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Pegawai</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Jenis Cuti
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tanggal
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Alasan
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cutiList.map((cuti, index) => (
                    <TableRow key={cuti.id}>
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {cuti.pegawai?.nama ?? "-"}
                          </span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {JENIS_CUTI_LABEL[cuti.jenis_cuti]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {JENIS_CUTI_LABEL[cuti.jenis_cuti]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">
                          {formatDateRange(
                            cuti.tanggal_mulai,
                            cuti.tanggal_selesai
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span
                          className="max-w-[180px] truncate block text-sm"
                          title={cuti.alasan}
                        >
                          {cuti.alasan}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={getStatusBadgeVariant(cuti.status)}
                          className="text-xs"
                        >
                          {STATUS_CUTI_LABEL[cuti.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Lihat Detail"
                            onClick={() => setDetailTarget(cuti)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {canApprove && cuti.status === "menunggu" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Setujui"
                                className="text-emerald-400 hover:text-emerald-300"
                                onClick={() =>
                                  openApprovalDialog(cuti, "approve")
                                }
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Tolak"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  openApprovalDialog(cuti, "reject")
                                }
                              >
                                <X className="size-4" />
                              </Button>
                            </>
                          )}
                          {cuti.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Hapus"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(cuti)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(page - 1) * perPage + 1}-
                  {Math.min(page * perPage, meta.total)} dari {meta.total} data
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map(
                    (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon-sm"
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Cuti Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => !open && resetCreateForm()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Cuti</DialogTitle>
            <DialogDescription>
              Buat pengajuan cuti baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-jenis">
                Jenis Cuti <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.jenis_cuti || undefined}
                onValueChange={(v) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    jenis_cuti: (v as JenisCuti) ?? "",
                  }))
                }
                items={JENIS_CUTI_LABEL}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Pilih Jenis Cuti" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_CUTI_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-mulai">
                  Tanggal Mulai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-mulai"
                  type="date"
                  value={createForm.tanggal_mulai}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      tanggal_mulai: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="create-selesai">
                  Tanggal Selesai <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-selesai"
                  type="date"
                  value={createForm.tanggal_selesai}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      tanggal_selesai: e.target.value,
                    }))
                  }
                  className="h-10 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-alasan">
                Alasan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="create-alasan"
                value={createForm.alasan}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    alasan: e.target.value,
                  }))
                }
                placeholder="Tuliskan alasan pengajuan cuti..."
                className="rounded-xl"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetCreateForm}
              >
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Mengajukan..." : "Ajukan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Cuti</DialogTitle>
            <DialogDescription>Informasi lengkap pengajuan cuti</DialogDescription>
          </DialogHeader>
          {detailTarget && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <span className="text-muted-foreground">Pegawai</span>
                <span className="font-medium">
                  {detailTarget.pegawai?.nama ?? "-"}
                </span>
                <span className="text-muted-foreground">Jenis Cuti</span>
                <span>
                  <Badge variant="outline" className="text-xs">
                    {JENIS_CUTI_LABEL[detailTarget.jenis_cuti]}
                  </Badge>
                </span>
                <span className="text-muted-foreground">Tanggal</span>
                <span>
                  {formatDateRange(
                    detailTarget.tanggal_mulai,
                    detailTarget.tanggal_selesai
                  )}
                </span>
                <span className="text-muted-foreground">Alasan</span>
                <span>{detailTarget.alasan}</span>
                <span className="text-muted-foreground">Status</span>
                <span>
                  <Badge
                    variant={getStatusBadgeVariant(detailTarget.status)}
                    className="text-xs"
                  >
                    {STATUS_CUTI_LABEL[detailTarget.status]}
                  </Badge>
                </span>
                {detailTarget.approver && (
                  <>
                    <span className="text-muted-foreground">Approver</span>
                    <span>{detailTarget.approver.username}</span>
                  </>
                )}
                {detailTarget.catatan_approval && (
                  <>
                    <span className="text-muted-foreground">Catatan</span>
                    <span>{detailTarget.catatan_approval}</span>
                  </>
                )}
                {detailTarget.approved_at && (
                  <>
                    <span className="text-muted-foreground">Tgl. Approval</span>
                    <span>{formatDate(detailTarget.approved_at)}</span>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTarget(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog
        open={!!approvalTarget}
        onOpenChange={(open) => !open && closeApprovalDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Setujui Cuti" : "Tolak Cuti"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approve"
                ? "Setujui pengajuan cuti berikut"
                : "Tolak pengajuan cuti berikut"}
            </DialogDescription>
          </DialogHeader>
          {approvalTarget && (
            <div className="flex flex-col gap-4">
              {/* Cuti details summary */}
              <div className="rounded-xl border bg-muted/50 p-3">
                <div className="grid grid-cols-[100px_1fr] gap-1.5 text-sm">
                  <span className="text-muted-foreground">Pegawai</span>
                  <span className="font-medium">
                    {approvalTarget.pegawai?.nama ?? "-"}
                  </span>
                  <span className="text-muted-foreground">Jenis</span>
                  <span>
                    {JENIS_CUTI_LABEL[approvalTarget.jenis_cuti]}
                  </span>
                  <span className="text-muted-foreground">Tanggal</span>
                  <span>
                    {formatDateRange(
                      approvalTarget.tanggal_mulai,
                      approvalTarget.tanggal_selesai
                    )}
                  </span>
                  <span className="text-muted-foreground">Alasan</span>
                  <span>{approvalTarget.alasan}</span>
                </div>
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="approval-note">
                  Catatan{" "}
                  {approvalAction === "reject" && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Textarea
                  id="approval-note"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder={
                    approvalAction === "approve"
                      ? "Catatan opsional..."
                      : "Alasan penolakan (wajib)..."
                  }
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeApprovalDialog}>
              Batal
            </Button>
            {approvalAction === "approve" ? (
              <Button
                onClick={handleApprovalSubmit}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? "Menyetujui..." : "Setujui"}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleApprovalSubmit}
                disabled={rejectMutation.isPending || !approvalNote.trim()}
              >
                {rejectMutation.isPending ? "Menolak..." : "Tolak"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengajuan Cuti</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan cuti ini? Hanya
              pengajuan berstatus draft yang dapat dihapus. Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
