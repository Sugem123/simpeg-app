"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pegawaiService } from "@/services/pegawai-service";
import { masterService } from "@/services/master-service";
import { useAuth } from "@/hooks/use-auth";
import { usePermission } from "@/hooks/use-permission";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Pegawai, PegawaiQueryParams } from "@/types";

export default function PegawaiPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const { isIndividuOnly, canManagePegawai } = usePermission();
  const canManage = canManagePegawai();

  // Individu (self-service) users must never see the full employee list.
  // Redirect them straight to their own record.
  useEffect(() => {
    if (isIndividuOnly() && user?.pegawai_id) {
      router.replace(`/pegawai/${user.pegawai_id}`);
    }
  }, [isIndividuOnly, user?.pegawai_id, router]);

  // Filter state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<Pegawai | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [jenisFilter, setJenisFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const params: PegawaiQueryParams = {
    page,
    per_page: perPage,
    search: search || undefined,
    status_kepegawaian_id: statusFilter || undefined,
    jenis_pegawai_id: jenisFilter || undefined,
    sort_by: sortBy || undefined,
    sort_dir: sortBy ? sortDir : undefined,
  };

  // Fetch pegawai
  const { data, isLoading, error } = useQuery({
    queryKey: ["pegawai", params],
    queryFn: () => pegawaiService.getPegawai(params),
    placeholderData: (prev) => prev,
  });

  // Fetch master data for filter dropdowns
  const { data: statusList } = useQuery({
    queryKey: ["master", "status-kepegawaian", "all"],
    queryFn: () => masterService.getAllMasterData("status-kepegawaian"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: jenisList } = useQuery({
    queryKey: ["master", "jenis-pegawai", "all"],
    queryFn: () => masterService.getAllMasterData("jenis-pegawai"),
    staleTime: 5 * 60 * 1000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => pegawaiService.deletePegawai(id),
    onSuccess: () => {
      toast.add({ title: "Data pegawai berhasil dihapus", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["pegawai"] });
      setDeleteTarget(null);
    },
    onError: () => {
      toast.add({ title: "Gagal menghapus data pegawai", type: "error" });
    },
  });

  const pegawaiList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="ml-1 size-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 size-3" />
    ) : (
      <ArrowDown className="ml-1 size-3" />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Data Pegawai
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola data pegawai SMAN 1 Prambon
          </p>
        </div>
        <Link href="/pegawai/create" className={canManage ? "" : "hidden"}>
          <Button className="w-full rounded-xl sm:w-auto">
            <Plus className="mr-2 size-4" />
            Tambah Pegawai
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIP, atau NUPTK..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-xl pl-9"
          />
        </div>
        <Select
          value={statusFilter || undefined}
          onValueChange={(v) => {
            setStatusFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
          items={Object.fromEntries([["__all__", "Semua Status"], ...(statusList?.data ?? []).map((i) => [i.id, i.nama])])}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-44">
            <SelectValue placeholder="Status Kepegawaian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Status</SelectItem>
            {(statusList?.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={jenisFilter || undefined}
          onValueChange={(v) => {
            setJenisFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
          items={Object.fromEntries([["__all__", "Semua Jenis"], ...(jenisList?.data ?? []).map((i) => [i.id, i.nama])])}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-40">
            <SelectValue placeholder="Jenis Pegawai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Jenis</SelectItem>
            {(jenisList?.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nama}
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
              Gagal memuat data pegawai. Periksa koneksi ke server.
            </p>
          </div>
        ) : pegawaiList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">
                Belum ada data pegawai
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Mulai dengan menambahkan data pegawai baru
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
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center hover:text-foreground"
                        onClick={() => toggleSort("nama")}
                      >
                        Nama
                        <SortIcon field="nama" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <button
                        type="button"
                        className="inline-flex items-center hover:text-foreground"
                        onClick={() => toggleSort("nip")}
                      >
                        NIP
                        <SortIcon field="nip" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Jabatan
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Unit Kerja
                    </TableHead>
                    <TableHead className="w-28 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pegawaiList.map((pegawai, index) => (
                    <TableRow key={pegawai.id}>
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {pegawai.nama_lengkap ?? pegawai.nama}
                          </span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {pegawai.nip ?? "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-sm">
                          {pegawai.nip ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pegawai.jabatan?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant={
                            pegawai.status_aktif ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {pegawai.status_kepegawaian?.nama ?? (pegawai.status_aktif ? "Aktif" : "Nonaktif")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {pegawai.unit_kerja?.nama ?? "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/pegawai/${pegawai.id}`}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Lihat Detail"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </Link>
                          {canManage && (
                            <Link href={`/pegawai/${pegawai.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                title="Edit"
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </Link>
                          )}
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Hapus"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(pegawai)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Pegawai</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data pegawai{" "}
              <strong>{deleteTarget?.nama}</strong>? Tindakan ini tidak dapat
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
