"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suratService } from "@/services/surat-service";
import { pegawaiService } from "@/services/pegawai-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Mail,
  FileText,
} from "lucide-react";
import type {
  Surat,
  SuratQueryParams,
  JenisSurat,
} from "@/types";
import { JENIS_SURAT_LABEL } from "@/types";

const JENIS_SURAT_OPTIONS = Object.entries(JENIS_SURAT_LABEL) as [
  JenisSurat,
  string,
][];

export default function SuratPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Surat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Surat | null>(null);
  const [detailTarget, setDetailTarget] = useState<Surat | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    nomor: "",
    jenis: "" as JenisSurat | "",
    pegawai_id: "",
    perihal: "",
    tanggal: "",
  });
  const [createFile, setCreateFile] = useState<File | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    nomor: "",
    jenis: "" as JenisSurat | "",
    perihal: "",
    tanggal: "",
  });

  const params: SuratQueryParams = {
    page,
    per_page: perPage,
    search: search || undefined,
    jenis: (jenisFilter as JenisSurat) || undefined,
  };

  // Fetch surat
  const { data, isLoading, error } = useQuery({
    queryKey: ["surat", params],
    queryFn: () => suratService.getAll(params),
    placeholderData: (prev) => prev,
  });

  // Fetch pegawai for select
  const { data: pegawaiData } = useQuery({
    queryKey: ["pegawai", "all-for-surat"],
    queryFn: () => pegawaiService.getPegawai({ per_page: 999 }),
    staleTime: 2 * 60 * 1000,
    enabled: createOpen,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (formData: FormData) => suratService.create(formData),
    onSuccess: () => {
      toast.add({ title: "Surat berhasil dibuat", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["surat"] });
      resetCreateForm();
    },
    onError: () => {
      toast.add({ title: "Gagal membuat surat", type: "error" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Surat> }) =>
      suratService.update(id, data),
    onSuccess: () => {
      toast.add({ title: "Surat berhasil diperbarui", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["surat"] });
      setEditTarget(null);
    },
    onError: () => {
      toast.add({ title: "Gagal memperbarui surat", type: "error" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => suratService.delete(id),
    onSuccess: () => {
      toast.add({ title: "Surat berhasil dihapus", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["surat"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.add({ title: "Gagal menghapus surat", type: "error" });
    },
  });

  const suratList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;
  const pegawaiOptions = pegawaiData?.data ?? [];

  const resetCreateForm = () => {
    setCreateOpen(false);
    setCreateForm({
      nomor: "",
      jenis: "",
      pegawai_id: "",
      perihal: "",
      tanggal: "",
    });
    setCreateFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !createForm.nomor ||
      !createForm.jenis ||
      !createForm.pegawai_id ||
      !createForm.tanggal
    ) {
      toast.add({ title: "Lengkapi semua field yang wajib", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("nomor", createForm.nomor);
    formData.append("jenis", createForm.jenis);
    formData.append("pegawai_id", createForm.pegawai_id);
    formData.append("perihal", createForm.perihal);
    formData.append("tanggal", createForm.tanggal);
    if (createFile) {
      formData.append("file_pdf", createFile);
    }

    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    updateMutation.mutate({
      id: editTarget.id,
      data: {
        nomor: editForm.nomor,
        jenis: editForm.jenis as JenisSurat,
        perihal: editForm.perihal || null,
        tanggal: editForm.tanggal,
      },
    });
  };

  const openEdit = (surat: Surat) => {
    setEditTarget(surat);
    setEditForm({
      nomor: surat.nomor,
      jenis: surat.jenis,
      perihal: surat.perihal ?? "",
      tanggal: surat.tanggal,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Surat
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola surat-menyurat SMAN 1 Prambon
          </p>
        </div>
        <Button
          className="w-full rounded-xl sm:w-auto"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Buat Surat
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nomor surat atau perihal..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Select
          value={jenisFilter || undefined}
          onValueChange={(v) => {
            setJenisFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
          items={Object.fromEntries([["__all__", "Semua Jenis"], ...JENIS_SURAT_OPTIONS])}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-44">
            <SelectValue placeholder="Jenis Surat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Jenis</SelectItem>
            {JENIS_SURAT_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              Gagal memuat data surat. Periksa koneksi ke server.
            </p>
          </div>
        ) : suratList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Mail className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">
                Belum ada data surat
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Mulai dengan membuat surat baru
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
                    <TableHead>Nomor Surat</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Jenis
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Pegawai
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Perihal
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tanggal
                    </TableHead>
                    <TableHead className="w-32 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suratList.map((surat, index) => (
                    <TableRow key={surat.id}>
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium font-mono text-sm">
                            {surat.nomor}
                          </span>
                          <span className="text-xs text-muted-foreground sm:hidden">
                            {JENIS_SURAT_LABEL[surat.jenis]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {JENIS_SURAT_LABEL[surat.jenis]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {surat.pegawai?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span
                          className="max-w-[200px] truncate block"
                          title={surat.perihal ?? ""}
                        >
                          {surat.perihal ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(surat.tanggal)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Lihat Detail"
                            onClick={() => setDetailTarget(surat)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {surat.file_pdf && (
                            <a
                              href={suratService.getDownloadUrl(surat.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Download PDF"
                              >
                                <Download className="size-4" />
                              </Button>
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Edit"
                            onClick={() => openEdit(surat)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Hapus"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(surat)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
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

      {/* Create Surat Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => !open && resetCreateForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Surat</DialogTitle>
            <DialogDescription>
              Buat surat baru dan upload file PDF
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-nomor">
                Nomor Surat <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-nomor"
                value={createForm.nomor}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, nomor: e.target.value }))
                }
                placeholder="001/SK/SMA/2026"
                className="h-10 rounded-xl"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-jenis">
                Jenis Surat <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.jenis || undefined}
                onValueChange={(v) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    jenis: (v as JenisSurat) ?? "",
                  }))
                }
                items={JENIS_SURAT_LABEL}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Pilih Jenis Surat" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_SURAT_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-pegawai">
                Pegawai <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.pegawai_id || undefined}
                onValueChange={(v) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    pegawai_id: v ?? "",
                  }))
                }
                items={Object.fromEntries(pegawaiOptions.map((p) => [p.id, p.nama_lengkap ?? p.nama]))}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Pilih Pegawai" />
                </SelectTrigger>
                <SelectContent>
                  {pegawaiOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama_lengkap ?? p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-perihal">Perihal</Label>
              <Input
                id="create-perihal"
                value={createForm.perihal}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    perihal: e.target.value,
                  }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-tanggal">
                Tanggal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-tanggal"
                type="date"
                value={createForm.tanggal}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    tanggal: e.target.value,
                  }))
                }
                className="h-10 rounded-xl"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-file">File PDF</Label>
              <Input
                ref={fileInputRef}
                id="create-file"
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setCreateFile(e.target.files?.[0] ?? null)
                }
                className="h-10 rounded-xl"
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
                {createMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Surat Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Surat</DialogTitle>
            <DialogDescription>Perbarui data surat</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-nomor">Nomor Surat</Label>
              <Input
                id="edit-nomor"
                value={editForm.nomor}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, nomor: e.target.value }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-jenis">Jenis Surat</Label>
              <Select
                value={editForm.jenis || undefined}
                onValueChange={(v) =>
                  setEditForm((prev) => ({
                    ...prev,
                    jenis: (v as JenisSurat) ?? "",
                  }))
                }
                items={JENIS_SURAT_LABEL}
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_SURAT_OPTIONS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-perihal">Perihal</Label>
              <Input
                id="edit-perihal"
                value={editForm.perihal}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    perihal: e.target.value,
                  }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-tanggal">Tanggal</Label>
              <Input
                id="edit-tanggal"
                type="date"
                value={editForm.tanggal}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    tanggal: e.target.value,
                  }))
                }
                className="h-10 rounded-xl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Surat Dialog */}
      <Dialog
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Surat</DialogTitle>
            <DialogDescription>Informasi lengkap surat</DialogDescription>
          </DialogHeader>
          {detailTarget && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                <span className="text-muted-foreground">Nomor</span>
                <span className="font-medium font-mono">
                  {detailTarget.nomor}
                </span>
                <span className="text-muted-foreground">Jenis</span>
                <span>
                  <Badge variant="outline" className="text-xs">
                    {JENIS_SURAT_LABEL[detailTarget.jenis]}
                  </Badge>
                </span>
                <span className="text-muted-foreground">Pegawai</span>
                <span>{detailTarget.pegawai?.nama ?? "-"}</span>
                <span className="text-muted-foreground">Perihal</span>
                <span>{detailTarget.perihal ?? "-"}</span>
                <span className="text-muted-foreground">Tanggal</span>
                <span>{formatDate(detailTarget.tanggal)}</span>
                <span className="text-muted-foreground">Dibuat oleh</span>
                <span>{detailTarget.creator?.username ?? "-"}</span>
                <span className="text-muted-foreground">File PDF</span>
                <span>
                  {detailTarget.file_pdf ? (
                    <a
                      href={suratService.getDownloadUrl(detailTarget.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <FileText className="size-3.5" />
                      Download
                    </a>
                  ) : (
                    "Tidak ada file"
                  )}
                </span>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Surat</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus surat{" "}
              <strong>{deleteTarget?.nomor}</strong>? Tindakan ini tidak dapat
              dibatalkan.
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
