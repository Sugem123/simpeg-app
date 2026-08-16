"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useSchoolPublic } from "@/hooks/use-school";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoldText } from "@/components/landing/motion";
import { BRAND } from "@/lib/constants/landing";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { isAxiosError } from "axios";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { data: schoolData } = useSchoolPublic();
  const school = schoolData?.data;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.add({ title: "Username dan password harus diisi", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      toast.add({ title: "Login berhasil!", type: "success" });
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.push(redirect);
    } catch (error: unknown) {
      let message = "Login gagal. Periksa username dan password Anda.";
      if (isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.add({ title: message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[440px]"
    >
      {/* Glass card with gold top accent */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.6),0_0_40px_rgba(251,191,36,0.06)] backdrop-blur-xl">
        {/* Gold top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
        {/* Soft inner glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-amber-400/10 blur-[80px]" />

        <div className="relative px-8 pb-8 pt-10 sm:px-10">
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-5"
            >
              <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl" />
              <div className="relative flex size-20 items-center justify-center rounded-full border border-amber-400/30 bg-gradient-to-b from-white/10 to-white/5 p-3 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
                <Image
                  src={school?.logo_url || BRAND.logoPath}
                  alt={school?.nama || BRAND.school}
                  width={56}
                  height={56}
                  className="size-14 object-contain"
                  priority
                  unoptimized={!!school?.logo_url}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                <GoldText>{BRAND.name}</GoldText>
              </h1>
              <p className="mt-1.5 text-sm text-slate-400">
                Sistem Informasi Manajemen Pegawai
              </p>
              <p className="mt-0.5 text-sm font-semibold tracking-wide text-slate-200">
                {school?.nama || BRAND.school}
              </p>
            </motion.div>

            {/* Divider badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300"
            >
              <Lock className="size-3" />
              Area Terbatas
            </motion.div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="username"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-amber-400/50 focus-visible:ring-amber-400/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  className="h-12 rounded-xl border-white/10 bg-white/5 pr-11 text-white placeholder:text-slate-500 focus-visible:border-amber-400/50 focus-visible:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-amber-300"
                  tabIndex={-1}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-sm font-bold text-[#1A1207] shadow-[0_8px_30px_rgba(251,191,36,0.35)] transition-all hover:shadow-[0_8px_40px_rgba(251,191,36,0.5)] hover:brightness-110 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </Button>
          </motion.form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="size-3.5 text-amber-400/70" />
              Terenkripsi & tercatat dalam audit log
            </div>
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-amber-300"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Kembali ke Beranda
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mt-6 text-center text-xs text-slate-600"
      >
        &copy; {new Date().getFullYear()} {BRAND.school} &middot; {BRAND.tagline}{" "}
        &middot; {BRAND.version}
      </motion.p>
    </motion.div>
  );
}
