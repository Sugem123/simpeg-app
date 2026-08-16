"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth-service";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Hash,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  Calendar,
  Building2,
} from "lucide-react";

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string } } })
      .response;
    if (resp?.data?.message) return resp.data.message;
  }
  if (err instanceof Error) return err.message;
  return "Terjadi kesalahan tidak terduga";
}

export default function ProfilPage() {
  const { user } = useAuth();
  const pegawai = user?.pegawai;

  // Change password state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => authService.changePassword(passwordForm),
    onSuccess: () => {
      toast.add({ title: "Password berhasil diubah", type: "success" });
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    },
    onError: (err) => {
      toast.add({ title: extractErrorMessage(err), type: "error" });
    },
  });

  const initials = pegawai?.nama
    ? pegawai.nama
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? "U";

  const infoItems = [
    {
      icon: Hash,
      label: "NIP",
      value: pegawai?.nip || "-",
    },
    {
      icon: Hash,
      label: "NUPTK",
      value: pegawai?.nuptk || "-",
    },
    {
      icon: Mail,
      label: "Email",
      value: user?.email || pegawai?.email || "-",
    },
    {
      icon: Phone,
      label: "No. HP",
      value: pegawai?.no_hp || "-",
    },
    {
      icon: Briefcase,
      label: "Jabatan",
      value: pegawai?.jabatan?.nama || "-",
    },
    {
      icon: Building2,
      label: "Unit Kerja",
      value: pegawai?.unit_kerja?.nama || "-",
    },
    {
      icon: Shield,
      label: "Status Kepegawaian",
      value: pegawai?.status_kepegawaian?.nama || "-",
    },
    {
      icon: MapPin,
      label: "Alamat",
      value: pegawai?.alamat || "-",
    },
    {
      icon: Calendar,
      label: "Tempat/Tanggal Lahir",
      value:
        pegawai?.tempat_lahir && pegawai?.tanggal_lahir
          ? `${pegawai.tempat_lahir}, ${new Date(pegawai.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
          : "-",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">
          Informasi akun dan data kepegawaian Anda
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-white/10 bg-card/60 backdrop-blur lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6">
            <Avatar className="size-24 ring-2 ring-amber-400/40">
              <AvatarFallback className="bg-gradient-to-br from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-2xl font-bold text-[#1A1207]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-center text-lg font-semibold">
              {pegawai?.nama ?? user?.username ?? "User"}
            </h2>
            <p className="text-sm text-muted-foreground">
              @{user?.username}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {user?.roles?.map((role) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className="border-amber-400/30 bg-amber-400/10 text-amber-300"
                >
                  {role.nama}
                </Badge>
              ))}
            </div>
            <Separator className="my-4 bg-white/10" />
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Jenis Pegawai</span>
                <span>{pegawai?.jenis_pegawai?.nama || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pangkat</span>
                <span>{pegawai?.pangkat?.nama || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Golongan</span>
                <span>{pegawai?.golongan?.nama || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={pegawai?.status_aktif ? "default" : "secondary"}
                  className={
                    pegawai?.status_aktif
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                      : ""
                  }
                >
                  {pegawai?.status_aktif ? "Aktif" : "Tidak Aktif"}
                </Badge>
              </div>
              {user?.last_login_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Login Terakhir</span>
                  <span className="text-xs">
                    {new Date(user.last_login_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Info Detail Card */}
          <Card className="border-white/10 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4 text-amber-400" />
                Informasi Detail
              </CardTitle>
              <CardDescription>Data kepegawaian Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                  >
                    <item.icon className="mt-0.5 size-4 shrink-0 text-amber-400/70" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium break-words">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-white/10 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="size-4 text-amber-400" />
                Ubah Password
              </CardTitle>
              <CardDescription>
                Minimal 12 karakter, harus mengandung huruf besar, huruf kecil,
                angka, dan karakter spesial (@$!%*#?&amp;)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  changePasswordMutation.mutate();
                }}
                className="space-y-4"
              >
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="current_password">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          current_password: e.target.value,
                        }))
                      }
                      required
                      autoComplete="current-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((s) => ({
                          ...s,
                          current: !s.current,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.password}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          password: e.target.value,
                        }))
                      }
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((s) => ({ ...s, new: !s.new }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">
                    Konfirmasi Password Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.password_confirmation}
                      onChange={(e) =>
                        setPasswordForm((f) => ({
                          ...f,
                          password_confirmation: e.target.value,
                        }))
                      }
                      required
                      minLength={12}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((s) => ({
                          ...s,
                          confirm: !s.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    changePasswordMutation.isPending ||
                    !passwordForm.current_password ||
                    !passwordForm.password ||
                    !passwordForm.password_confirmation
                  }
                  className="bg-amber-500 text-[#1A1207] hover:bg-amber-400"
                >
                  {changePasswordMutation.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 size-4" />
                  )}
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
