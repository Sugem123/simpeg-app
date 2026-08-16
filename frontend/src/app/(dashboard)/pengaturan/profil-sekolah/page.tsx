"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { schoolService } from "@/services/school-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Save, Upload, ImageIcon, Loader2 } from "lucide-react";
import type { SchoolProfile } from "@/types";

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tidak terduga";
}

export default function ProfilSekolahPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["school-profile"],
    queryFn: () => schoolService.get(),
  });

  const profile = profileData?.data;

  const [formData, setFormData] = useState<SchoolProfile>({
    nama: "",
    npsn: "",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
    logo_path: null,
    logo_url: null,
    kepala_sekolah: "",
    nip_kepala: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setLogoPreview(profile.logo_url);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SchoolProfile>) => schoolService.update(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["school-profile"] });
      toast.add({ title: "Profil sekolah berhasil disimpan", type: "success" });
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      toast.add({ title: "Gagal menyimpan profil sekolah", description: msg, type: "error" });
    },
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => schoolService.uploadLogo(file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["school-profile"] });
      setLogoPreview(res.data.logo_url);
      setLogoFile(null);
      toast.add({ title: "Logo sekolah berhasil diupload", type: "success" });
    },
    onError: (err) => {
      const msg = extractErrorMessage(err);
      toast.add({ title: "Gagal mengupload logo", description: msg, type: "error" });
    },
  });

  const handleChange = (field: keyof SchoolProfile, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.add({ title: "Ukuran file maksimal 2MB", type: "error" });
      return;
    }

    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.add({ title: "Format file tidak didukung. Gunakan PNG, JPG, SVG, atau WebP", type: "error" });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = () => {
    if (logoFile) {
      logoMutation.mutate(logoFile);
    }
  };

  const isSaving = updateMutation.isPending;
  const isUploading = logoMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
      <div className="flex flex-col gap-6">
        {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Profil Sekolah
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pengaturan informasi dan logo sekolah
          </p>
        </div>
        <Button
          className="w-full rounded-xl sm:w-auto"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* School Info */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Informasi Sekolah</CardTitle>
            <CardDescription>Data identitas sekolah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nama">Nama Sekolah *</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleChange("nama", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="SMAN 1 Prambon"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="npsn">NPSN</Label>
                <Input
                  id="npsn"
                  value={formData.npsn ?? ""}
                  onChange={(e) => handleChange("npsn", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="20510078"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={formData.alamat ?? ""}
                  onChange={(e) => handleChange("alamat", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="Jl. Raya Prambon, Kab. Nganjuk"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Kontak</CardTitle>
            <CardDescription>Informasi kontak sekolah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="telepon">Telepon</Label>
                <Input
                  id="telepon"
                  value={formData.telepon ?? ""}
                  onChange={(e) => handleChange("telepon", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="(0358) 771234"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="info@sman1prambon.sch.id"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website ?? ""}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="https://sman1prambon.sch.id"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kepala Sekolah */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Kepala Sekolah</CardTitle>
            <CardDescription>Data pejabat kepala sekolah</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="kepala_sekolah">Nama Kepala Sekolah</Label>
                <Input
                  id="kepala_sekolah"
                  value={formData.kepala_sekolah ?? ""}
                  onChange={(e) => handleChange("kepala_sekolah", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="Drs. Bambang Supriyanto"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nip_kepala">NIP Kepala Sekolah</Label>
                <Input
                  id="nip_kepala"
                  value={formData.nip_kepala ?? ""}
                  onChange={(e) => handleChange("nip_kepala", e.target.value)}
                  className="h-10 rounded-xl"
                  placeholder="196812051993031008"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle>Logo Sekolah</CardTitle>
            <CardDescription>
              Upload logo sekolah untuk ditampilkan di sidebar, header, surat, dan laporan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-muted">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo Sekolah"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <Building2 className="size-12 text-muted-foreground/40" />
                  )}
                </div>
                {logoPreview && (
                  <span className="text-xs text-muted-foreground">Logo saat ini</span>
                )}
              </div>

              {/* Upload Area */}
              <div className="flex flex-1 flex-col items-center gap-4 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <ImageIcon className="size-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Klik untuk pilih file
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, SVG, atau WebP (Maks. 2MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 size-4" />
                    Pilih File
                  </Button>
                  {logoFile && (
                    <Button
                      className="rounded-xl"
                      onClick={handleLogoUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  )}
                </div>
                {logoFile && (
                  <p className="text-xs text-muted-foreground">
                    File dipilih: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
  );
}
