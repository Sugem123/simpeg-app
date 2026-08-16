"use client";

import { SECURITY_FEATURES } from "@/lib/constants/landing";
import { Reveal, SectionHeading } from "./motion";

export function Security() {
  return (
    <section id="keamanan" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Keamanan Enterprise"
          title="Data Anda Terlindungi"
          description="Standar keamanan tingkat enterprise untuk melindungi data kepegawaian dari ancaman."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_FEATURES.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-all duration-300 hover:border-blue-400/40 hover:shadow-[0_8px_40px_rgba(59,130,246,0.15)]">
                <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-blue-500/10 opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex size-12 items-center justify-center rounded-xl bg-blue-500/15 ring-1 ring-blue-400/30 transition-all duration-300 group-hover:scale-110">
                  <Icon className="size-6 text-blue-400" />
                </div>

                <h3 className="relative mt-5 font-heading text-base font-bold text-white">
                  {title}
                </h3>
                <p className="relative mt-2 text-sm text-slate-400">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}