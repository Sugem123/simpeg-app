"use client";

import { FEATURES } from "@/lib/constants/landing";
import { Reveal, SectionHeading } from "./motion";

export function Features() {
  return (
    <section id="fitur" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Fitur Unggulan"
          title="Semua yang Anda Butuhkan dalam Satu Platform"
          description="SIMPEG menghadirkan fitur lengkap untuk mengelola seluruh kebutuhan administrasi kepegawaian sekolah secara terintegrasi."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-white/[0.08] hover:shadow-[0_12px_48px_rgba(0,0,0,0.4)]">
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex size-13 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 ring-1 ring-amber-400/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                  <Icon className="size-7 text-amber-400" />
                </div>

                <h3 className="relative mt-5 font-heading text-lg font-bold text-white">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}