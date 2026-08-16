"use client";

import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { BRAND, CONTACT_INFO, FOOTER_LINKS, NAV_LINKS } from "@/lib/constants/landing";

export function Footer() {
  return (
    <footer id="kontak" className="relative border-t border-white/10 bg-[#050A14]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src={BRAND.logoPath}
                alt={`Logo ${BRAND.school}`}
                className="size-12 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]"
              />
              <div className="flex flex-col leading-none">
                <span className="font-heading text-lg font-bold text-amber-300">
                  {BRAND.name}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                  {BRAND.school}
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              {BRAND.description}
            </p>
            <div className="mt-6 space-y-2 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-amber-400" />
                {CONTACT_INFO.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 text-amber-400" />
                {CONTACT_INFO.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-amber-400" />
                {CONTACT_INFO.email}
              </p>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Navigasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-amber-300"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Aplikasi */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Aplikasi
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-amber-300"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <GraduationCap className="size-4 text-amber-400" />
            © {new Date().getFullYear()} {BRAND.school}. Hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Sistem Informasi Manajemen Kepegawaian</span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              {BRAND.version}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}