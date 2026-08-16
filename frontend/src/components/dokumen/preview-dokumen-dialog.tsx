"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { dokumenService } from "@/services/dokumen-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, AlertTriangle, FileText } from "lucide-react";
import { KATEGORI_DOKUMEN_LABEL, type Dokumen } from "@/types";

interface PreviewDokumenDialogProps {
  dok: Dokumen | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function PreviewContent({ dok }: { dok: Dokumen }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    setLoading(true);
    setError(false);

    api.get('/dokumen/' + dok.id + '/preview', { responseType: "blob" })
      .then((res) => {
        if (!active) return;
        const contentType = String(res.headers["content-type"] || dok.mime_type || "application/octet-stream");
        const blob = new Blob([res.data], { type: contentType });
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Preview load error:", err);
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [dok.id, dok.mime_type]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat pratinjau dokumen...</p>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertTriangle className="size-10 text-destructive/60" />
        <p className="text-sm font-medium text-muted-foreground">Gagal memuat pratinjau dokumen</p>
        <a href={dokumenService.getDownloadUrl(dok.id)} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="mr-2 size-4" /> Unduh Dokumen
          </Button>
        </a>
      </div>
    );
  }

  const ext = dok.nama_file.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "svg"].includes(ext) || (dok.mime_type && dok.mime_type.startsWith("image/"));
  const isPdf = ext === "pdf" || dok.mime_type === "application/pdf";

  if (isImage) {
    return (
      <div className="flex max-h-[70vh] w-full items-center justify-center overflow-auto p-2">
        <img
          src={blobUrl}
          alt={dok.nama_file}
          className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain shadow-md"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="h-[70vh] w-full overflow-hidden rounded-xl border bg-background shadow-inner">
        <iframe
          src={blobUrl}
          className="h-full w-full border-none"
          title={dok.nama_file}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <FileText className="size-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{dok.nama_file}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Pratinjau langsung tidak didukung untuk format .{ext.toUpperCase()}. Silakan unduh berkas.
        </p>
      </div>
      <a href={dokumenService.getDownloadUrl(dok.id)} download>
        <Button className="rounded-xl">
          <Download className="mr-2 size-4" /> Unduh Berkas
        </Button>
      </a>
    </div>
  );
}

export function PreviewDokumenDialog({ dok, open, onOpenChange }: PreviewDokumenDialogProps) {
  if (!dok) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl p-6 sm:max-w-5xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 pr-6">
          <div className="flex flex-col gap-1 min-w-0 pr-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {KATEGORI_DOKUMEN_LABEL[dok.kategori] ?? dok.kategori}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatBytes(dok.ukuran)}
              </span>
            </div>
            <DialogTitle className="truncate text-lg font-bold">
              {dok.nama_file}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={dokumenService.getDownloadUrl(dok.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline" className="rounded-xl">
                <Download className="mr-1.5 size-4" /> Unduh
              </Button>
            </a>
          </div>
        </DialogHeader>

        <div className="mt-4 flex min-h-[400px] flex-col items-center justify-center">
          <PreviewContent dok={dok} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
