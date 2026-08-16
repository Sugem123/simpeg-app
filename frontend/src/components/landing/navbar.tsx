"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "@/lib/constants/landing";
import { useSchoolPublic } from "@/hooks/use-school";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: schoolData } = useSchoolPublic();
  const school = schoolData?.data;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#070D1B]/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="#beranda" className="flex items-center gap-3">
          <div className="relative">
            <img
              src={school?.logo_url || BRAND.logoPath}
              alt={`Logo ${school?.nama || BRAND.school}`}
              className="size-10 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading text-base font-bold tracking-tight text-amber-300">
              {BRAND.name}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              {school?.nama || BRAND.school}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-gradient-to-r from-amber-400 to-amber-600 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="group hidden items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2 text-sm font-semibold text-amber-200 transition-all duration-300 hover:border-amber-400/70 hover:bg-amber-400/20 hover:shadow-[0_0_24px_rgba(251,191,36,0.25)] sm:inline-flex"
          >
            Masuk ke Sistem
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 bg-[#070D1B]/95 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E] px-5 py-2.5 text-sm font-semibold text-[#0B132B]"
            >
              Masuk ke Sistem
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}