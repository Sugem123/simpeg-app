"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { pegawaiService } from "@/services/pegawai-service";
import { masterService, type MasterType } from "@/services/master-service";
import { toast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import type { MasterData, Pegawai } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

interface FormData {
  // Step 1: Identitas
  nik: string;
  nip: string;
  nuptk: string;
  nama: string;
  gelar_depan: string;
  gelar_belakang: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama_id: string;
  email: string;
  no_hp: string;
  alamat: string;
  // Step 2: Kepegawaian
  jenis_pegawai_id: string;
  status_kepegawaian_id: string;
  jabatan_id: string;
  pangkat_id: string;
  golongan_id: string;
  unit_kerja_id: string;
}

interface StepError {
  [key: string]: string;
}

const INITIAL_FORM: FormData = {
  nik: "",
  nip: "",
  nuptk: "",
  nama: "",
  gelar_depan: "",
  gelar_belakang: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  agama_id: "",
  email: "",
  no_hp: "",
  alamat: "",
  jenis_pegawai_id: "",
  status_kepegawaian_id: "",
  jabatan_id: "",
  pangkat_id: "",
  golongan_id: "",
  unit_kerja_id: "",
};

const STEPS = [
  { id: 1, title: "Identitas", icon: User },
  { id: 2, title: "Kepegawaian", icon: Briefcase },
  { id: 3, title: "Konfirmasi", icon: ClipboardCheck },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function useMasterData(type: MasterType) {
  return useQuery({
    queryKey: ["master", type, "all"],
    queryFn: () => masterService.getAllMasterData(type),
    staleTime: 5 * 60 * 1000,
  });
}

function findMasterLabel(list: MasterData[], id: string): string {
  return list.find((item) => item.id === id)?.nama ?? "-";
}

// ─── Components ─────────────────────────────────────────────────

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick?: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              className="flex items-center gap-2"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isCompleted
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  <Icon className="size-4" />
                )}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                      ? "text-emerald-400"
                      : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`h-px w-8 sm:w-16 ${
                  currentStep > step.id ? "bg-green-600" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function MasterSelect({
  label,
  required,
  value,
  onChange,
  masterType,
  error,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  masterType: MasterType;
  error?: string;
  placeholder?: string;
}) {
  const { data, isLoading } = useMasterData(masterType);
  const items = data?.data ?? [];

  if (isLoading) {
    return (
      <FormField label={label} required={required}>
        <Skeleton className="h-8 w-full rounded-lg" />
      </FormField>
    );
  }

  return (
    <FormField label={label} required={required} error={error}>
      <Select value={value || undefined} onValueChange={(v) => onChange(v ?? "")} items={Object.fromEntries(items.map((item) => [item.id, item.nama]))}>
        <SelectTrigger className="w-full rounded-xl">
          <SelectValue placeholder={placeholder ?? `Pilih ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.nama}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

// ─── Step Components ────────────────────────────────────────────

function StepIdentitas({
  form,
  errors,
  onChange,
}: {
  form: FormData;
  errors: StepError;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="NIK" required error={errors.nik}>
        <Input
          value={form.nik}
          onChange={(e) => onChange("nik", e.target.value)}
          placeholder="Nomor Induk Kependudukan (16 digit)"
          maxLength={16}
          className="rounded-xl"
        />
      </FormField>

      <FormField label="NIP" error={errors.nip}>
        <Input
          value={form.nip}
          onChange={(e) => onChange("nip", e.target.value)}
          placeholder="Nomor Induk Pegawai"
          className="rounded-xl"
        />
      </FormField>

      <FormField label="NUPTK" error={errors.nuptk}>
        <Input
          value={form.nuptk}
          onChange={(e) => onChange("nuptk", e.target.value)}
          placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
          className="rounded-xl"
        />
      </FormField>

      <FormField label="Nama Lengkap" required error={errors.nama}>
        <Input
          value={form.nama}
          onChange={(e) => onChange("nama", e.target.value)}
          placeholder="Nama tanpa gelar"
          className="rounded-xl"
        />
      </FormField>

      <FormField label="Gelar Depan" error={errors.gelar_depan}>
        <Input
          value={form.gelar_depan}
          onChange={(e) => onChange("gelar_depan", e.target.value)}
          placeholder="Contoh: Dr., Prof."
          className="rounded-xl"
        />
      </FormField>

      <FormField label="Gelar Belakang" error={errors.gelar_belakang}>
        <Input
          value={form.gelar_belakang}
          onChange={(e) => onChange("gelar_belakang", e.target.value)}
          placeholder="Contoh: S.Pd., M.Pd."
          className="rounded-xl"
        />
      </FormField>

      <FormField label="Tempat Lahir" required error={errors.tempat_lahir}>
        <Input
          value={form.tempat_lahir}
          onChange={(e) => onChange("tempat_lahir", e.target.value)}
          placeholder="Kota/Kabupaten"
          className="rounded-xl"
        />
      </FormField>

      <FormField label="Tanggal Lahir" required error={errors.tanggal_lahir}>
        <Input
          type="date"
          value={form.tanggal_lahir}
          onChange={(e) => onChange("tanggal_lahir", e.target.value)}
          className="rounded-xl"
        />
      </FormField>

      <FormField
        label="Jenis Kelamin"
        required
        error={errors.jenis_kelamin}
      >
        <Select
          value={form.jenis_kelamin || undefined}
          onValueChange={(v) => onChange("jenis_kelamin", v ?? "")}
          items={{ L: "Laki-laki", P: "Perempuan" }}
        >
          <SelectTrigger className="w-full rounded-xl">
            <SelectValue placeholder="Pilih Jenis Kelamin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Laki-laki</SelectItem>
            <SelectItem value="P">Perempuan</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <MasterSelect
        label="Agama"
        required
        value={form.agama_id}
        onChange={(v) => onChange("agama_id", v)}
        masterType="agama"
        error={errors.agama_id}
      />

      <FormField label="Email" required error={errors.email}>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="email@contoh.com"
          className="rounded-xl"
        />
      </FormField>

      <FormField label="No. HP" error={errors.no_hp}>
        <Input
          type="tel"
          value={form.no_hp}
          onChange={(e) => onChange("no_hp", e.target.value)}
          placeholder="08xxxxxxxxxx"
          className="rounded-xl"
        />
      </FormField>

      <div className="sm:col-span-2">
        <FormField label="Alamat" error={errors.alamat}>
          <Textarea
            value={form.alamat}
            onChange={(e) => onChange("alamat", e.target.value)}
            placeholder="Alamat lengkap"
            rows={3}
            className="rounded-xl"
          />
        </FormField>
      </div>
    </div>
  );
}

function StepKepegawaian({
  form,
  errors,
  onChange,
}: {
  form: FormData;
  errors: StepError;
  onChange: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MasterSelect
        label="Jenis Pegawai"
        required
        value={form.jenis_pegawai_id}
        onChange={(v) => onChange("jenis_pegawai_id", v)}
        masterType="jenis-pegawai"
        error={errors.jenis_pegawai_id}
      />

      <MasterSelect
        label="Status Kepegawaian"
        required
        value={form.status_kepegawaian_id}
        onChange={(v) => onChange("status_kepegawaian_id", v)}
        masterType="status-kepegawaian"
        error={errors.status_kepegawaian_id}
      />

      <MasterSelect
        label="Jabatan"
        value={form.jabatan_id}
        onChange={(v) => onChange("jabatan_id", v)}
        masterType="jabatan"
        error={errors.jabatan_id}
      />

      <MasterSelect
        label="Pangkat"
        value={form.pangkat_id}
        onChange={(v) => onChange("pangkat_id", v)}
        masterType="pangkat"
        error={errors.pangkat_id}
      />

      <MasterSelect
        label="Golongan"
        value={form.golongan_id}
        onChange={(v) => onChange("golongan_id", v)}
        masterType="golongan"
        error={errors.golongan_id}
      />

      <MasterSelect
        label="Unit Kerja"
        value={form.unit_kerja_id}
        onChange={(v) => onChange("unit_kerja_id", v)}
        masterType="unit-kerja"
        error={errors.unit_kerja_id}
      />
    </div>
  );
}

function StepKonfirmasi({
  form,
  masterData,
}: {
  form: FormData;
  masterData: Record<string, MasterData[]>;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Identitas Summary */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <User className="size-4" />
          Data Identitas
        </h3>
        <div className="rounded-xl border bg-muted/30 p-4">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">NIK</dt>
              <dd className="text-sm font-medium">{form.nik || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">NIP</dt>
              <dd className="text-sm font-medium">{form.nip || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">NUPTK</dt>
              <dd className="text-sm font-medium">{form.nuptk || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Nama Lengkap</dt>
              <dd className="text-sm font-medium">
                {[form.gelar_depan, form.nama, form.gelar_belakang]
                  .filter(Boolean)
                  .join(" ") || "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Tempat, Tanggal Lahir
              </dt>
              <dd className="text-sm font-medium">
                {form.tempat_lahir
                  ? `${form.tempat_lahir}, ${formatDate(form.tanggal_lahir)}`
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Jenis Kelamin</dt>
              <dd className="text-sm font-medium">
                {form.jenis_kelamin === "L"
                  ? "Laki-laki"
                  : form.jenis_kelamin === "P"
                    ? "Perempuan"
                    : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Agama</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(masterData.agama ?? [], form.agama_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Email</dt>
              <dd className="text-sm font-medium">{form.email || "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">No. HP</dt>
              <dd className="text-sm font-medium">{form.no_hp || "-"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Alamat</dt>
              <dd className="text-sm font-medium">{form.alamat || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Separator />

      {/* Kepegawaian Summary */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Briefcase className="size-4" />
          Data Kepegawaian
        </h3>
        <div className="rounded-xl border bg-muted/30 p-4">
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Jenis Pegawai</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(
                  masterData["jenis-pegawai"] ?? [],
                  form.jenis_pegawai_id
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                Status Kepegawaian
              </dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(
                  masterData["status-kepegawaian"] ?? [],
                  form.status_kepegawaian_id
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Jabatan</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(masterData.jabatan ?? [], form.jabatan_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Pangkat</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(masterData.pangkat ?? [], form.pangkat_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Golongan</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(masterData.golongan ?? [], form.golongan_id)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Unit Kerja</dt>
              <dd className="text-sm font-medium">
                {findMasterLabel(
                  masterData["unit-kerja"] ?? [],
                  form.unit_kerja_id
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────

export default function CreatePegawaiPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<StepError>({});

  // Fetch all master data for dropdowns and confirmation
  const { data: agamaData } = useMasterData("agama");
  const { data: jenisPegawaiData } = useMasterData("jenis-pegawai");
  const { data: statusKepegawaianData } = useMasterData("status-kepegawaian");
  const { data: jabatanData } = useMasterData("jabatan");
  const { data: pangkatData } = useMasterData("pangkat");
  const { data: golonganData } = useMasterData("golongan");
  const { data: unitKerjaData } = useMasterData("unit-kerja");

  const masterData: Record<string, MasterData[]> = {
    agama: agamaData?.data ?? [],
    "jenis-pegawai": jenisPegawaiData?.data ?? [],
    "status-kepegawaian": statusKepegawaianData?.data ?? [],
    jabatan: jabatanData?.data ?? [],
    pangkat: pangkatData?.data ?? [],
    golongan: golonganData?.data ?? [],
    "unit-kerja": unitKerjaData?.data ?? [],
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Pegawai>) => pegawaiService.createPegawai(data),
    onSuccess: (response) => {
      toast.add({ title: "Data pegawai berhasil ditambahkan", type: "success" });
      const newId = response.data?.id;
      router.push(newId ? `/pegawai/${newId}` : "/pegawai");
    },
    onError: () => {
      toast.add({
        title: "Gagal menambahkan data pegawai",
        type: "error",
      });
    },
  });

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: StepError = {};

    if (step === 1) {
      if (!form.nik.trim()) newErrors.nik = "NIK wajib diisi";
      else if (form.nik.trim().length !== 16)
        newErrors.nik = "NIK harus 16 digit";

      if (!form.nama.trim()) newErrors.nama = "Nama wajib diisi";
      if (!form.tempat_lahir.trim())
        newErrors.tempat_lahir = "Tempat lahir wajib diisi";
      if (!form.tanggal_lahir)
        newErrors.tanggal_lahir = "Tanggal lahir wajib diisi";
      if (!form.jenis_kelamin)
        newErrors.jenis_kelamin = "Jenis kelamin wajib dipilih";
      if (!form.agama_id) newErrors.agama_id = "Agama wajib dipilih";
      if (!form.email.trim()) newErrors.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        newErrors.email = "Format email tidak valid";
    }

    if (step === 2) {
      if (!form.jenis_pegawai_id)
        newErrors.jenis_pegawai_id = "Jenis pegawai wajib dipilih";
      if (!form.status_kepegawaian_id)
        newErrors.status_kepegawaian_id = "Status kepegawaian wajib dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Build payload, only include non-empty values
    const payload: Partial<Pegawai> = {
      nik: form.nik,
      nama: form.nama,
      tempat_lahir: form.tempat_lahir,
      tanggal_lahir: form.tanggal_lahir,
      jenis_kelamin: form.jenis_kelamin as "L" | "P",
      agama_id: form.agama_id,
      email: form.email,
      jenis_pegawai_id: form.jenis_pegawai_id,
      status_kepegawaian_id: form.status_kepegawaian_id,
    };

    // Optional fields
    if (form.nip) payload.nip = form.nip;
    if (form.nuptk) payload.nuptk = form.nuptk;
    if (form.gelar_depan) payload.gelar_depan = form.gelar_depan;
    if (form.gelar_belakang) payload.gelar_belakang = form.gelar_belakang;
    if (form.no_hp) payload.no_hp = form.no_hp;
    if (form.alamat) payload.alamat = form.alamat;
    if (form.jabatan_id) payload.jabatan_id = form.jabatan_id;
    if (form.pangkat_id) payload.pangkat_id = form.pangkat_id;
    if (form.golongan_id) payload.golongan_id = form.golongan_id;
    if (form.unit_kerja_id) payload.unit_kerja_id = form.unit_kerja_id;

    createMutation.mutate(payload);
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Back Link */}
      <Link
        href="/pegawai"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Daftar Pegawai
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Tambah Pegawai Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lengkapi data untuk menambahkan pegawai baru
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Label */}
      <div className="text-center">
        <Badge variant="secondary" className="text-xs">
          Langkah {currentStep} dari {STEPS.length}
        </Badge>
      </div>

      {/* Form Card */}
      <Card>
        <CardContent className="pt-2">
          {currentStep === 1 && (
            <StepIdentitas form={form} errors={errors} onChange={onChange} />
          )}
          {currentStep === 2 && (
            <StepKepegawaian form={form} errors={errors} onChange={onChange} />
          )}
          {currentStep === 3 && (
            <StepKonfirmasi form={form} masterData={masterData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 size-4" />
          Sebelumnya
        </Button>

        {currentStep < 3 ? (
          <Button className="rounded-xl" onClick={handleNext}>
            Selanjutnya
            <ArrowRight className="ml-2 size-4" />
          </Button>
        ) : (
          <Button
            className="rounded-xl"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 size-4" />
                Simpan Data Pegawai
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
