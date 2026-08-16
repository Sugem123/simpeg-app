"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { get, post, patch, del } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  RefreshCw,
  Shield,
  UserPlus,
  Mail,
  Loader2,
  Check,
} from "lucide-react";
import type { ApiResponse, User, Role } from "@/types";

interface UserListResponse {
  success: boolean;
  message: string;
  data: User[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

interface PegawaiWithoutAccountResponse {
  success: boolean;
  message: string;
  data: PegawaiWithoutAccount[];
  meta: { page: number; per_page: number; total: number; last_page: number };
}

interface PegawaiWithoutAccount {
  id: string;
  nip: string | null;
  nama: string;
  gelar_depan: string | null;
  gelar_belakang: string | null;
  email: string;
  jenis_kelamin: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");

  // Create form
  const [createForm, setCreateForm] = useState({
    pegawai_id: "",
    username: "",
    email: "",
    password: "",
    role_id: "",
  });

  // Sync form
  const [syncForm, setSyncForm] = useState({
    pegawai_id: "",
    role_id: "",
    generate_username: true,
    username: "",
    email: "",
    password: "",
  });
  const [syncSearch, setSyncSearch] = useState("");
  const [syncError, setSyncError] = useState("");

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, perPage, search],
    queryFn: () =>
      get<UserListResponse>("/users", {
        params: { page, per_page: perPage, search: search || undefined },
      }),
    placeholderData: (prev) => prev,
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => get<ApiResponse<Role[]>>("/roles"),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch pegawai without account (for sync modal)
  const { data: pegawaiData, isLoading: pegawaiLoading } = useQuery({
    queryKey: ["pegawai-without-account", syncSearch],
    queryFn: () =>
      get<PegawaiWithoutAccountResponse>("/pegawai-without-account", {
        params: {
          per_page: 50,
          search: syncSearch || undefined,
        },
      }),
    enabled: syncOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: typeof createForm) =>
      post<ApiResponse<User>>("/users", data),
    onSuccess: () => {
      toast.add({ title: "Pengguna berhasil ditambahkan", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setCreateOpen(false);
      setCreateForm({ pegawai_id: "", username: "", email: "", password: "", role_id: "" });
    },
    onError: () => toast.add({ title: "Gagal menambahkan pengguna", type: "error" }),
  });

  const syncMutation = useMutation({
    mutationFn: (data: typeof syncForm) =>
      post<ApiResponse<User>>("/users/sync-from-pegawai", data),
    onSuccess: () => {
      toast.add({ title: "Akun berhasil disinkronkan dari pegawai", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["pegawai-without-account"] });
      setSyncOpen(false);
      setSyncForm({
        pegawai_id: "",
        role_id: "",
        generate_username: true,
        username: "",
        email: "",
        password: "",
      });
      setSyncError("");
    },
    onError: (error: unknown) => {
      const response = axios.isAxiosError(error)
        ? (error.response?.data as {
            message?: string;
            errors?: Record<string, string[]>;
          } | undefined)
        : undefined;
      const validationMessage = response?.errors
        ? Object.values(response.errors).flat()[0]
        : undefined;

      setSyncError(
        validationMessage ?? response?.message ?? "Terjadi kesalahan saat sinkronisasi."
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del<ApiResponse<null>>(`/users/${id}`),
    onSuccess: () => {
      toast.add({ title: "Pengguna berhasil dihapus", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteTarget(null);
    },
    onError: () => toast.add({ title: "Gagal menghapus pengguna", type: "error" }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      patch<ApiResponse<null>>(`/users/${id}/reset-password`, { new_password: password }),
    onSuccess: () => {
      toast.add({ title: "Password berhasil direset", type: "success" });
      setResetTarget(null);
      setNewPassword("");
      setResetError("");
    },
    onError: (error: unknown) => {
      const response = axios.isAxiosError(error)
        ? (error.response?.data as {
            message?: string;
            errors?: Record<string, string[]>;
          } | undefined)
        : undefined;
      const validationMessage = response?.errors
        ? Object.values(response.errors).flat()[0]
        : undefined;
      setResetError(
        validationMessage ?? response?.message ?? "Terjadi kesalahan saat mereset password."
      );
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      patch<ApiResponse<User>>(`/users/${id}/${activate ? "activate" : "deactivate"}`),
    onSuccess: (_, variables) => {
      toast.add({
        title: `Pengguna berhasil ${variables.activate ? "diaktifkan" : "dinonaktifkan"}`,
        type: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => toast.add({ title: "Gagal mengubah status pengguna", type: "error" }),
  });

  const userList = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.last_page ?? 1;
  const roles = rolesData?.data ?? [];
  const pegawaiOptions = (pegawaiData?.data ?? []) as PegawaiWithoutAccount[];

  // Stats
  const totalUsers = meta?.total ?? 0;
  const activeUsers = userList.filter((u) => u.is_active).length;
  const inactiveUsers = userList.filter((u) => !u.is_active).length;

  function handleSyncPegawaiSelect(pegawaiId: string) {
    const pegawai = pegawaiOptions.find((p) => p.id === pegawaiId);
    setSyncForm((prev) => ({
      ...prev,
      pegawai_id: pegawaiId,
      email: pegawai?.email ?? "",
    }));
  }

  function handleSyncSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSyncError("");
    if (!syncForm.pegawai_id || !syncForm.role_id || !syncForm.email || !syncForm.password) {
      setSyncError("Lengkapi field yang wajib diisi.");
      return;
    }
    if (!syncForm.generate_username && !syncForm.username) {
      setSyncError("Username harus diisi.");
      return;
    }
    if (syncForm.password.length < 8) {
      setSyncError("Password minimal 8 karakter.");
      return;
    }
    const payload = { ...syncForm };
    if (payload.generate_username) {
      delete (payload as Record<string, unknown>).username;
    }
    syncMutation.mutate(payload);
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.username || !createForm.email || !createForm.password || !createForm.role_id) {
      toast.add({ title: "Lengkapi semua field yang wajib", type: "error" });
      return;
    }
    createMutation.mutate(createForm);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ─── Page Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-6 backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/8 blur-[80px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-amber-400" />
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Manajemen <span className="text-gold-gradient">Akun Pengguna</span>
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Kelola akun login sistem — terpisah dari manajemen data pegawai.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-amber-400/25 bg-amber-400/5 text-amber-300 hover:bg-amber-400/10 hover:text-amber-200"
              onClick={() => setSyncOpen(true)}
            >
              <RefreshCw className="mr-2 size-4" />
              Sinkronkan dari Pegawai
            </Button>
            <Button
              className="rounded-xl bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)] hover:shadow-[0_8px_40px_rgba(251,191,36,0.45)] hover:brightness-110"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-2 size-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="relative mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Total Akun</span>
            <p className="font-heading text-xl font-bold">{totalUsers}</p>
          </div>
          <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Aktif</span>
            <p className="font-heading text-xl font-bold text-emerald-400">{activeUsers}</p>
          </div>
          <div className="rounded-xl border border-rose-400/15 bg-rose-400/[0.05] px-4 py-2.5">
            <span className="text-xs text-muted-foreground">Nonaktif</span>
            <p className="font-heading text-xl font-bold text-rose-400">{inactiveUsers}</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Search ────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari username, email, atau nama pegawai..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500 focus-visible:border-amber-400/50"
        />
      </div>

      {/* ─── Data Table ────────────────────────────────────── */}
      <div className="gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm">
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
              Gagal memuat data pengguna. Periksa koneksi ke server.
            </p>
          </div>
        ) : userList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Users className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-muted-foreground">Belum ada data pengguna</p>
              <p className="mt-1 text-sm text-muted-foreground/70">
                Mulai dengan menambahkan atau sinkronisasi dari pegawai
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="w-12 text-muted-foreground">No</TableHead>
                    <TableHead className="text-muted-foreground">Username</TableHead>
                    <TableHead className="hidden md:table-cell text-muted-foreground">Email</TableHead>
                    <TableHead className="hidden lg:table-cell text-muted-foreground">Pegawai</TableHead>
                    <TableHead className="hidden sm:table-cell text-muted-foreground">Role</TableHead>
                    <TableHead className="hidden sm:table-cell text-muted-foreground">Status</TableHead>
                    <TableHead className="hidden xl:table-cell text-muted-foreground">Login Terakhir</TableHead>
                    <TableHead className="w-36 text-right text-muted-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="border-white/5 transition-colors hover:bg-white/[0.03]"
                    >
                      <TableCell className="text-muted-foreground">
                        {(page - 1) * perPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-xs font-bold text-[#1A1207] ring-1 ring-amber-400/30">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.username}</span>
                            <span className="text-xs text-muted-foreground md:hidden">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {user.pegawai?.nama ?? "-"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className="border-amber-400/25 bg-amber-400/10 text-amber-300"
                        >
                          {user.roles?.[0]?.nama ?? "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-400/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                            <span className="size-1.5 rounded-full bg-rose-400" />
                            Nonaktif
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground text-xs">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="Reset Password"
                            onClick={() => setResetTarget(user)}>
                            <KeyRound className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm"
                            title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: user.id, activate: !user.is_active,
                              })
                            }>
                            {user.is_active ? (
                              <UserX className="size-4 text-orange-400" />
                            ) : (
                              <UserCheck className="size-4 text-emerald-400" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon-sm" title="Hapus"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(user)}>
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
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Menampilkan {(page - 1) * perPage + 1}-
                  {Math.min(page * perPage, meta.total)} dari {meta.total} data
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon-sm" disabled={page <= 1}
                    onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button key={pageNum} variant={page === pageNum ? "default" : "outline"}
                        size="icon-sm" onClick={() => setPage(pageNum)}>
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="icon-sm" disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Sync from Pegawai Dialog ─────────────────────────── */}
      <Dialog
        open={syncOpen}
        onOpenChange={(open) => {
          setSyncOpen(open);
          if (!open) setSyncError("");
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="size-5 text-amber-400" />
              Sinkronkan Akun dari Pegawai
            </DialogTitle>
            <DialogDescription>
              Buat akun login otomatis dari data pegawai yang sudah terdaftar.
              Username dapat di-generate otomatis dari nama pegawai.
            </DialogDescription>
          </DialogHeader>

          {/* Pegawai search */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama pegawai..."
              value={syncSearch}
              onChange={(e) => setSyncSearch(e.target.value)}
              className="h-10 rounded-xl border-white/10 bg-white/5 pl-9 focus-visible:border-amber-400/50"
            />
          </div>

          <form onSubmit={handleSyncSubmit} className="flex flex-col gap-4">
            {/* Pegawai selector */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Pilih Pegawai <span className="text-destructive">*</span>
              </Label>
              {pegawaiLoading ? (
                <div className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Memuat data pegawai...</span>
                </div>
              ) : pegawaiOptions.length === 0 ? (
                <div className="flex h-10 items-center rounded-xl border border-white/10 bg-white/5 px-3">
                  <span className="text-sm text-muted-foreground">
                    Semua pegawai sudah memiliki akun
                  </span>
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
                  {pegawaiOptions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSyncPegawaiSelect(p.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/5 ${
                        syncForm.pegawai_id === p.id ? "bg-amber-400/10" : ""
                      }`}
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/15 text-xs font-bold text-blue-400 ring-1 ring-blue-400/20">
                        {p.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium">{p.nama}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.nip ?? "Tanpa NIP"} &middot; {p.email}
                        </span>
                      </div>
                      {syncForm.pegawai_id === p.id && (
                        <Check className="size-4 text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto-generate username toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Generate Username Otomatis</span>
                <span className="text-xs text-muted-foreground">
                  Dibuat dari nama pegawai (contoh: budi123)
                </span>
              </div>
              <Switch
                checked={syncForm.generate_username}
                onCheckedChange={(v) =>
                  setSyncForm((prev) => ({ ...prev, generate_username: v }))
                }
              />
            </div>

            {/* Manual username (if not auto-generate) */}
            {!syncForm.generate_username && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sync-username" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sync-username"
                  value={syncForm.username}
                  onChange={(e) =>
                    setSyncForm((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sync-email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sync-email"
                type="email"
                value={syncForm.email}
                onChange={(e) =>
                  setSyncForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sync-password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sync-password"
                type="password"
                value={syncForm.password}
                onChange={(e) =>
                  setSyncForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimal 8 karakter"
                className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                required
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sync-role" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={syncForm.role_id || undefined}
                onValueChange={(v) =>
                  setSyncForm((prev) => ({ ...prev, role_id: v ?? "" }))
                }
                items={Object.fromEntries(roles.map((r) => [r.id, r.nama]))}
              >
                <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/5">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {syncError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSyncOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={syncMutation.isPending}
                className="bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.3)]"
              >
                {syncMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Menyinkronkan...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    Sinkronkan
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Create User Dialog ───────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="size-5 text-amber-400" />
              Tambah Pengguna Baru
            </DialogTitle>
            <DialogDescription>
              Buat akun pengguna manual untuk sistem SIMPEG
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-username" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Username <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-username"
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, username: e.target.value }))
                }
                className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Minimal 12 karakter (huruf besar, kecil, angka, simbol)"
                className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-role" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={createForm.role_id || undefined}
                onValueChange={(v) =>
                  setCreateForm((prev) => ({ ...prev, role_id: v ?? "" }))
                }
                items={Object.fromEntries(roles.map((r) => [r.id, r.nama]))}
              >
                <SelectTrigger className="w-full rounded-xl border-white/10 bg-white/5">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createMutation.isPending}
                className="bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207]">
                {createMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── Reset Password Dialog ────────────────────────────── */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={(open) => {
          if (!open) { setResetTarget(null); setNewPassword(""); setResetError(""); }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-amber-400" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Reset password untuk pengguna{" "}
              <strong className="text-amber-300">{resetTarget?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Password Baru</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="h-10 rounded-xl border-white/10 bg-white/5 focus-visible:border-amber-400/50"
            />
          </div>
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="text-xs text-amber-300">Password minimal 8 karakter.</p>
          )}
          {resetError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetTarget(null); setNewPassword(""); setResetError(""); }}>
              Batal
            </Button>
            <Button
              onClick={() => {
                if (!resetTarget || !newPassword) return;
                setResetError("");
                resetPasswordMutation.mutate({ id: resetTarget.id, password: newPassword });
              }}
              disabled={!newPassword || newPassword.length < 8 || resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Mereset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ──────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Hapus Pengguna
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <strong className="text-destructive">{deleteTarget?.username}</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
