"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pegawaiService } from "@/services/pegawai-service";
import { masterService } from "@/services/master-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Search,
  BarChart3,
  Download,
  FileSpreadsheet,
  FileDown,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { PegawaiQueryParams } from "@/types";

export default function LaporanPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [jabatanFilter, setJabatanFilter] = useState<string>("");
  const [unitKerjaFilter, setUnitKerjaFilter] = useState<string>("");
  const [jenisFilter, setJenisFilter] = useState<string>("");

  const params: PegawaiQueryParams = {
    page,
    per_page: perPage,
    search: search || undefined,
    status_kepegawaian_id: statusFilter || undefined,
    jabatan_id: jabatanFilter || undefined,
    unit_kerja_id: unitKerjaFilter || undefined,
    jenis_pegawai_id: jenisFilter || undefined,
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["pegawai", "laporan", params],
    queryFn: () => pegawaiService.getPegawai(params),
    placeholderData: (prev) => prev,
  });

  const { data: statusList } = useQuery({
    queryKey: ["master", "status-kepegawaian", "all"],
    queryFn: () => masterService.getAllMasterData("status-kepegawaian"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: jabatanList } = useQuery({
    queryKey: ["master", "jabatan", "all"],
    queryFn: () => masterService.getAllMasterData("jabatan"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: unitKerjaList } = useQuery({
    queryKey: ["master", "unit-kerja", "all"],
    queryFn: () => masterService.getAllMasterData("unit-kerja"),
    staleTime: 5 * 60 * 1000,
  });

  const { data: jenisList } = useQuery({
    queryKey: ["master", "jenis-pegawai", "all"],
    queryFn: () => masterService.getAllMasterData("jenis-pegawai"),
    staleTime: 5 * 60 * 1000,
  });

  const pegawaiList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;

  const handleExport = (type: "excel" | "pdf") => {
    toast.add({
      title: `Export ${type === "excel" ? "Excel" : "PDF"}: Fitur sedang dikembangkan`,
      type: "info",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Laporan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Laporan data pegawai SMAN 1 Prambon
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet className="mr-2 size-4" />
            Export Excel
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => handleExport("pdf")}
          >
            <FileDown className="mr-2 size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Total Pegawai (Filter)</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                meta?.total ?? 0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardDescription>Halaman</CardDescription>
            <CardTitle className="text-2xl">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${page} / ${totalPages}`
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIP, NUPTK..."
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
          value={jabatanFilter || undefined}
          onValueChange={(v) => {
            setJabatanFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
          items={Object.fromEntries([["__all__", "Semua Jabatan"], ...(jabatanList?.data ?? []).map((i) => [i.id, i.nama])])}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-40">
            <SelectValue placeholder="Jabatan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Jabatan</SelectItem>
            {(jabatanList?.data ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={unitKerjaFilter || undefined}
          onValueChange={(v) => {
            setUnitKerjaFilter(v === "__all__" ? "" : (v ?? ""));
            setPage(1);
          }}
          items={Object.fromEntries([["__all__", "Semua Unit Kerja"], ...(unitKerjaList?.data ?? []).map((i) => [i.id, i.nama])])}
        >
          <SelectTrigger className="w-full rounded-xl sm:w-40">
            <SelectValue placeholder="Unit Kerja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Semua Unit Kerja</SelectItem>
            {(unitKerjaList?.data ?? []).map((item) => (
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
              Gagal memuat data laporan. Periksa koneksi ke server.
            </p>
          </div>
        ) : pegawaiList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BarChart3 className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">
                Tidak ada data ditemukan
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Coba ubah filter untuk menampilkan data
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
                    <TableHead>Nama</TableHead>
                    <TableHead className="hidden md:table-cell">NIP</TableHead>
                    <TableHead className="hidden lg:table-cell">Jabatan</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Unit Kerja</TableHead>
                    <TableHead className="hidden xl:table-cell">Jenis</TableHead>
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
                          variant={pegawai.status_aktif ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {pegawai.status_kepegawaian?.nama ??
                            (pegawai.status_aktif ? "Aktif" : "Nonaktif")}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {pegawai.unit_kerja?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {pegawai.jenis_pegawai?.nama ?? "-"}
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
    </div>
  );
}
