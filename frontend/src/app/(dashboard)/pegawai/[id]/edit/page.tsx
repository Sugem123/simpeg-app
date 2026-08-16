"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  AlertTriangle,
} from "lucide-react";
import type { MasterData, Pegawai } from "@/types";
import { usePermission } from "@/hooks/use-permission";

// ─── Types ──────────────────────────────────────────────────────

interface FormData {
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
  onStepClick: (step: number) => void;
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
              onClick={() => onStepClick(step.id)}
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
  disabled,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  masterType: MasterType;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
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
      <Select disabled={disabled} value={value || undefined} onValueChange={(v) => onChange(v ?? "")} items={Object.fromEntries(items.map((item) => [item.id, item.nama]))}>
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
  individuOnly,
  initialNip,
}: {
  form: FormData;
  errors: StepError;
  onChange: (field: keyof FormData, value: string) => void;
  individuOnly?: boolean;
  initialNip?: string | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="NIK" required error={errors.nik}>
        <Input
          value={form.nik}
          onChange={(e) => onChange("nik", e.target.value)}
          placeholder="Nomor Induk Kependudukan (16 digit)"
          maxLength={16}
          className="rounded-xl disabled:opacity-60"
        />
      </FormField>

      <FormField label="NIP" error={errors.nip}>
        <Input
          value={form.nip}
          onChange={(e) => onChange("nip", e.target.value)}
          placeholder="Nomor Induk Pegawai"
          disabled={individuOnly && Boolean(initialNip)}
          className="rounded-xl disabled:opacity-60"
        />
      </FormField>

      <FormField label="NUPTK" error={errors.nuptk}>
        <Input
          value={form.nuptk}
          onChange={(e) => onChange("nuptk", e.target.value)}
          placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
          className="rounded-xl disabled:opacity-60"
        />
      </FormField>

      <FormField label="Nama Lengkap" required error={errors.nama}>
        <Input
          value={form.nama}
          onChange={(e) => onChange("nama", e.target.value)}
          placeholder="Nama tanpa gelar"
          className="rounded-xl disabled:opacity-60"
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

      <FormField label="Jenis Kelamin" required error={errors.jenis_kelamin}>
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
  disabled,
}: {
  form: FormData;
  errors: StepError;
  onChange: (field: keyof FormData, value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {disabled && (
        <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          Data kepegawaian hanya dapat diubah oleh Admin/Fasilitator. Hubungi
          admin jika terdapat data yang perlu diperbaiki.
        </div>
      )}

      <MasterSelect
        label="Jenis Pegawai"
        required={!disabled}
        value={form.jenis_pegawai_id}
        onChange={(v) => onChange("jenis_pegawai_id", v)}
        masterType="jenis-pegawai"
        error={errors.jenis_pegawai_id}
        disabled={disabled}
      />

      <MasterSelect
        label="Status Kepegawaian"
        required={!disabled}
        value={form.status_kepegawaian_id}
        onChange={(v) => onChange("status_kepegawaian_id", v)}
        masterType="status-kepegawaian"
        error={errors.status_kepegawaian_id}
        disabled={disabled}
      />

      <MasterSelect
        label="Jabatan"
        value={form.jabatan_id}
        onChange={(v) => onChange("jabatan_id", v)}
        masterType="jabatan"
        error={errors.jabatan_id}
        disabled={disabled}
      />

      <MasterSelect
        label="Pangkat"
        value={form.pangkat_id}
        onChange={(v) => onChange("pangkat_id", v)}
        masterType="pangkat"
        error={errors.pangkat_id}
        disabled={disabled}
      />

      <MasterSelect
        label="Golongan"
        value={form.golongan_id}
        onChange={(v) => onChange("golongan_id", v)}
        masterType="golongan"
        error={errors.golongan_id}
        disabled={disabled}
      />

      <MasterSelect
        label="Unit Kerja"
        value={form.unit_kerja_id}
        onChange={(v) => onChange("unit_kerja_id", v)}
        masterType="unit-kerja"
        error={errors.unit_kerja_id}
        disabled={disabled}
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

// ─── Loading Skeleton ───────────────────────────────────────────

function EditFormSkeleton() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Skeleton className="h-5 w-48" />
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <Skeleton className="mx-auto h-10 w-96" />
      <Card>
        <CardContent className="pt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────

export default function EditPegawaiPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isIndividuOnly } = usePermission();
  const individuOnly = isIndividuOnly();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<StepError>({});

  // Fetch existing pegawai data
  const {
    data: pegawaiData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["pegawai", id],
    queryFn: () => pegawaiService.getPegawaiById(id),
    enabled: !!id,
  });

  // Fetch all master data
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

  // Pre-fill form when pegawai data loads
  useEffect(() => {
    if (pegawaiData?.data && !form) {
      const p = pegawaiData.data;
      setForm({
        nik: p.nik ?? "",
        nip: p.nip ?? "",
        nuptk: p.nuptk ?? "",
        nama: p.nama ?? "",
        gelar_depan: p.gelar_depan ?? "",
        gelar_belakang: p.gelar_belakang ?? "",
        tempat_lahir: p.tempat_lahir ?? "",
        tanggal_lahir: p.tanggal_lahir ?? "",
        jenis_kelamin: p.jenis_kelamin ?? "",
        agama_id: p.agama_id ?? "",
        email: p.email ?? "",
        no_hp: p.no_hp ?? "",
        alamat: p.alamat ?? "",
        jenis_pegawai_id: p.jenis_pegawai_id ?? "",
        status_kepegawaian_id: p.status_kepegawaian_id ?? "",
        jabatan_id: p.jabatan_id ?? "",
        pangkat_id: p.pangkat_id ?? "",
        golongan_id: p.golongan_id ?? "",
        unit_kerja_id: p.unit_kerja_id ?? "",
      });
    }
  }, [pegawaiData, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Pegawai>) =>
      pegawaiService.updatePegawai(id, data),
    onSuccess: () => {
      toast.add({ title: "Data pegawai berhasil diperbarui", type: "success" });
      router.push(`/pegawai/${id}`);
    },
    onError: () => {
      toast.add({ title: "Gagal memperbarui data pegawai", type: "error" });
    },
  });

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    if (!form) return false;
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

    if (step === 2 && !individuOnly) {
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

  // Allow jumping between steps (edit mode)
  const handleStepClick = (step: number) => {
    // Validate current step before jumping forward
    if (step > currentStep) {
      if (!validateStep(currentStep)) return;
    }
    setCurrentStep(step);
  };

  const handleSubmit = () => {
    if (!form) return;

    // Individu may only update personal fields (matches backend whitelist).
    if (individuOnly) {
      const payload: Partial<Pegawai> = {
        nik: form.nik,
        nama: form.nama,
        gelar_depan: form.gelar_depan || null,
        gelar_belakang: form.gelar_belakang || null,
        tempat_lahir: form.tempat_lahir,
        tanggal_lahir: form.tanggal_lahir,
        jenis_kelamin: form.jenis_kelamin as "L" | "P",
        agama_id: form.agama_id,
        email: form.email,
        no_hp: form.no_hp || null,
        alamat: form.alamat || null,
        nuptk: form.nuptk || null,
      };
      if (!pegawaiData?.data?.nip) {
        payload.nip = form.nip || null;
      }
      updateMutation.mutate(payload);
      return;
    }

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
      nip: form.nip || null,
      nuptk: form.nuptk || null,
      gelar_depan: form.gelar_depan || null,
      gelar_belakang: form.gelar_belakang || null,
      no_hp: form.no_hp || null,
      alamat: form.alamat || null,
      jabatan_id: form.jabatan_id || null,
      pangkat_id: form.pangkat_id || null,
      golongan_id: form.golongan_id || null,
      unit_kerja_id: form.unit_kerja_id || null,
    };

    updateMutation.mutate(payload);
  };

  // Loading state
  if (isLoading) {
    return <EditFormSkeleton />;
  }

  // Error state
  if (fetchError || !pegawaiData?.data) {
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
          onClick={() => router.push("/pegawai")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Pegawai
        </Button>
      </div>
    );
  }

  // Wait for form to be initialized
  if (!form) {
    return <EditFormSkeleton />;
  }

  const pegawaiName =
    pegawaiData.data.nama_lengkap ?? pegawaiData.data.nama;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Back Link */}
      <Link
        href={`/pegawai/${id}`}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Profil Pegawai
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {individuOnly ? "Edit Data Diri" : "Edit Data Pegawai"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {individuOnly
            ? "Perbarui data pribadi Anda. Data kepegawaian hanya dapat diubah oleh admin."
            : `Perbarui data ${pegawaiName}`}
        </p>
      </div>

      {/* Step Indicator - clickable in edit mode */}
      <StepIndicator
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

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
            <StepIdentitas
              form={form}
              errors={errors}
              onChange={onChange}
              individuOnly={individuOnly}
              initialNip={pegawaiData.data.nip}
            />
          )}
          {currentStep === 2 && (
            <StepKepegawaian
              form={form}
              errors={errors}
              onChange={onChange}
              disabled={individuOnly}
            />
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
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 size-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
