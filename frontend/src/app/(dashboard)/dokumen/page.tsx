"use client";
import { PreviewDokumenDialog } from "@/components/dokumen/preview-dokumen-dialog";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { dokumenService } from "@/services/dokumen-service";
import { pegawaiService } from "@/services/pegawai-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Upload, Download, Trash2, FileArchive, Loader2, Eye } from "lucide-react";
import type { KategoriDokumen, Dokumen } from "@/types";
import { KATEGORI_DOKUMEN_LABEL } from "@/types";

export default function DokumenPage() {
  const qc = useQueryClient();
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDok, setPreviewDok] = useState<Dokumen | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadKategori, setUploadKategori] = useState<KategoriDokumen>("lainnya");
  const [uploadKeterangan, setUploadKeterangan] = useState("");

  // Fetch pegawai list for selector
  const { data: pegawaiData, isLoading: pegawaiLoading } = useQuery({
    queryKey: ["pegawai-list-dokumen"],
    queryFn: () => pegawaiService.getPegawai({ per_page: 100 }),
  });

  const pegawaiList = pegawaiData?.data ?? [];

  // Fetch dokumen for selected pegawai
  const { data: dokumenData, isLoading: dokumenLoading } = useQuery({
    queryKey: ["dokumen-pegawai", selectedPegawaiId],
    queryFn: () => dokumenService.getByPegawai(selectedPegawaiId, { per_page: 100 }),
    enabled: !!selectedPegawaiId,
  });

  const dokumenList = dokumenData?.data ?? [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: { pegawaiId: string; file: File; kategori: KategoriDokumen; keterangan: string }) => {
      const formData = new FormData();
      formData.append("pegawai_id", data.pegawaiId);
      formData.append("file", data.file);
      formData.append("kategori", data.kategori);
      if (data.keterangan) formData.append("keterangan", data.keterangan);
      return dokumenService.upload(data.pegawaiId, formData);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dokumen-pegawai", selectedPegawaiId] });
      setUploadOpen(false);
      setUploadFile(null);
      setUploadKeterangan("");
      toast.add({ title: "Dokumen berhasil diupload", type: "success" });
    },
    onError: (err) => {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Gagal upload"
        : "Gagal upload";
      toast.add({ title: "Gagal upload dokumen", description: msg, type: "error" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dokumenService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dokumen-pegawai", selectedPegawaiId] });
      toast.add({ title: "Dokumen berhasil dihapus", type: "success" });
    },
    onError: () => {
      toast.add({ title: "Gagal menghapus dokumen", type: "error" });
    },
  });

  const handleDownload = async (id: string, nama: string) => {
    try {
      const response = await api.get(`/dokumen/${id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = nama;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.add({ title: "Gagal mengunduh dokumen", type: "error" });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Arsip Dokumen</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola dokumen kepegawaian per pegawai
          </p>
        </div>
        {selectedPegawaiId && (
          <Button className="rounded-xl" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 size-4" />
            Upload Dokumen
          </Button>
        )}
      </div>

      {/* Pegawai Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Pilih Pegawai</label>
        <Select
          value={selectedPegawaiId || undefined}
          onValueChange={(v) => setSelectedPegawaiId(v ?? "")}
          items={Object.fromEntries(pegawaiList.map((p) => [p.id, p.nama_lengkap ?? p.nama]))}
        >
          <SelectTrigger className="h-10 w-full max-w-md rounded-xl">
            <SelectValue placeholder={pegawaiLoading ? "Memuat..." : "Pilih pegawai"} />
          </SelectTrigger>
          <SelectContent>
            {pegawaiList.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nama_lengkap ?? p.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dokumen Table */}
      {!selectedPegawaiId ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/25 py-16">
          <FileArchive className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Pilih pegawai untuk melihat arsip dokumen
          </p>
        </div>
      ) : dokumenLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : dokumenList.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-muted-foreground/25 py-16">
          <FileText className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Belum ada dokumen</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama File</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Ukuran</TableHead>
                <TableHead>Tanggal Upload</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dokumenList.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell
                    className="font-medium hover:underline cursor-pointer"
                    onClick={() => setPreviewDok(doc)}
                  >
                    {doc.nama_file}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {KATEGORI_DOKUMEN_LABEL[doc.kategori] ?? doc.kategori}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatBytes(doc.ukuran)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setPreviewDok(doc)}
                        title="Pratinjau Dokumen"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleDownload(doc.id, doc.nama_file)}
                        title="Unduh Dokumen"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        disabled={deleteMutation.isPending}
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
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Dokumen</DialogTitle>
            <DialogDescription>
              Upload dokumen kepegawaian untuk pegawai terpilih
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={uploadKategori}
                onValueChange={(v) => setUploadKategori(v as KategoriDokumen)}
                items={KATEGORI_DOKUMEN_LABEL}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KATEGORI_DOKUMEN_LABEL).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Keterangan (opsional)</label>
              <input
                type="text"
                value={uploadKeterangan}
                onChange={(e) => setUploadKeterangan(e.target.value)}
                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                placeholder="Keterangan dokumen"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">File</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (uploadFile && selectedPegawaiId) {
                  uploadMutation.mutate({
                    pegawaiId: selectedPegawaiId,
                    file: uploadFile,
                    kategori: uploadKategori,
                    keterangan: uploadKeterangan,
                  });
                }
              }}
              disabled={!uploadFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
