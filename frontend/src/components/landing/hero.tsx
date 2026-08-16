"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Search,
  Bell,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  FileCheck2,
  ChevronRight,
  Activity,
} from "lucide-react";
import { BRAND, HERO_TRUST_BADGES } from "@/lib/constants/landing";
import { GoldText } from "./motion";

// ─── Trust Badges ───────────────────────────────────────────────

function TrustBadges() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      {HERO_TRUST_BADGES.map(({ icon: Icon, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
          className="flex items-center gap-2 text-xs font-medium text-slate-400"
        >
          <Icon className="size-4 text-amber-400" />
          {label}
          {i < HERO_TRUST_BADGES.length - 1 && (
            <span className="ml-2 hidden size-1 rounded-full bg-slate-600 sm:block" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Glowing Emblem ─────────────────────────────────────────────

function Emblem() {
  return (
    <div className="relative mx-auto mb-10 hidden size-40 lg:block">
      {/* Aura */}
      <div className="absolute inset-0 rounded-full bg-blue-600/30 blur-3xl" />
      {/* Rotating rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-amber-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-3 rounded-full border border-amber-400/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      {/* Logo */}
      <div className="absolute inset-6 flex items-center justify-center rounded-full bg-[#0B132B]/80 backdrop-blur">
        <img
          src={BRAND.logoPath}
          alt={`Logo ${BRAND.school}`}
          className="size-24 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
        />
      </div>
    </div>
  );
}

// ─── Dashboard Mockup ───────────────────────────────────────────

function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: typeof Users;
  label: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className={`flex size-8 items-center justify-center rounded-lg ${color}`}>
          <Icon className="size-4" />
        </span>
        <TrendingUp className="size-3.5 text-emerald-400" />
      </div>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 text-[10px] font-medium text-emerald-400">{trend}</p>
    </div>
  );
}

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-blue-600/20 blur-2xl" />

      {/* Window */}
      <div
        className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-[#0C1526]/90 shadow-2xl backdrop-blur-xl"
        style={{ transform: "perspective(1200px) rotateY(-6deg)" }}
      >
        {/* Window header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-amber-600">
              <GraduationCap className="size-3.5 text-[#0B132B]" />
            </div>
            <span className="text-xs font-semibold text-white">SIMPEG</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
              <Search className="size-3" />
              Cari menu...
            </div>
            <div className="relative flex size-6 items-center justify-center rounded-md bg-white/5">
              <Bell className="size-3 text-slate-300" />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-amber-400" />
            </div>
            <div className="flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[9px] font-bold text-white">
              A
            </div>
          </div>
        </div>

        {/* Mockup body */}
        <div className="flex gap-3 p-3">
          {/* Mini sidebar */}
          <div className="hidden w-20 flex-col gap-1.5 sm:flex">
            {[
              "Dashboard",
              "Pegawai",
              "Dokumen",
              "Surat",
              "Laporan",
            ].map((m, i) => (
              <div
                key={m}
                className={`rounded-md px-2 py-1.5 text-[10px] ${
                  i === 0
                    ? "bg-amber-400/15 font-semibold text-amber-300"
                    : "bg-white/5 text-slate-400"
                }`}
              >
                {m}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={Users} label="Total Pegawai" value="100" trend="+12%" color="bg-blue-500/20 text-blue-400" />
              <StatCard icon={GraduationCap} label="Guru" value="82" trend="+8%" color="bg-emerald-500/20 text-emerald-400" />
              <StatCard icon={Briefcase} label="Staf" value="18" trend="+5%" color="bg-amber-500/20 text-amber-400" />
              <StatCard icon={FileCheck2} label="PPPK" value="17" trend="+7%" color="bg-purple-500/20 text-purple-400" />
            </div>

            {/* Chart + donut */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-slate-300">Grafik Pegawai</span>
                  <span className="text-[9px] text-emerald-400">▲ Aktif</span>
                </div>
                {/* Fake line chart */}
                <svg viewBox="0 0 160 60" className="mt-2 w-full">
                  <defs>
                    <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 50 L20 42 L40 46 L60 34 L80 38 L100 26 L120 30 L140 18 L160 22 L160 60 L0 60 Z"
                    fill="url(#area)"
                  />
                  <path
                    d="M0 50 L20 42 L40 46 L60 34 L80 38 L100 26 L120 30 L140 18 L160 22"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {[20, 60, 100, 140].map((x, i) => (
                    <circle key={i} cx={x} cy={[42, 34, 26, 18][i]} r="3" fill="#3B82F6" stroke="#0C1526" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>

              {/* Donut */}
              <div className="hidden w-24 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 sm:flex">
                <svg viewBox="0 0 80 80" className="size-16">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#1E293B" strokeWidth="10" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#F5C542" strokeWidth="10"
                    strokeDasharray="188 220" strokeDashoffset="0" transform="rotate(-90 40 40)" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="#3B82F6" strokeWidth="10"
                    strokeDasharray="80 220" strokeDashoffset="-188" transform="rotate(-90 40 40)" />
                </svg>
                <span className="mt-1 text-[9px] text-slate-400">Komposisi</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                <Activity className="size-3 text-amber-400" />
                Timeline Aktivitas
              </div>
              <div className="mt-2 space-y-1.5">
                {[
                  "SK baru: Budi Santoso",
                  "KGB: 2 pegawai terjadwal",
                  "Dokumen diunggah: 5 file",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <span className="size-1 rounded-full bg-amber-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 top-10 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-[#0C1526]/90 px-3 py-1.5 text-[10px] font-medium text-emerald-300 shadow-lg backdrop-blur"
      >
        <TrendingUp className="size-3" />
        Data Terupdate
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-4 bottom-16 flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-[#0C1526]/90 px-3 py-1.5 text-[10px] font-medium text-amber-300 shadow-lg backdrop-blur"
      >
        <Sparkles className="size-3" />
        Enterprise Ready
      </motion.div>
    </motion.div>
  );
}

// ─── Hero Main ──────────────────────────────────────────────────

export function Hero() {
  return (
    <section id="beranda" className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left */}
        <div className="flex flex-col items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-300">
              <Sparkles className="size-3.5" />
              Enterprise HR Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-heading text-5xl font-extrabold leading-none tracking-tight sm:text-6xl lg:text-7xl"
          >
            <GoldText>{BRAND.name}</GoldText>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl"
          >
            {BRAND.school}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-2 text-base font-medium text-cyan-300/90"
          >
            {BRAND.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400"
          >
            {BRAND.description}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] px-7 py-3.5 text-sm font-bold text-[#0B132B] shadow-[0_8px_30px_rgba(220,165,50,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_40px_rgba(220,165,50,0.5)]"
            >
              Masuk ke Sistem
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-amber-200 backdrop-blur transition-all duration-300 hover:border-amber-400/70 hover:bg-amber-400/10"
            >
              Jelajahi Fitur
              <ChevronRight className="size-4" />
            </a>
          </motion.div>

          <TrustBadges />
        </div>

        {/* Right */}
        <div className="relative">
          <Emblem />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}