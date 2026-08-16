"use client";

import { TECH_STACK } from "@/lib/constants/landing";
import { Reveal, SectionHeading } from "./motion";

export function Technology() {
  return (
    <section id="teknologi" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Teknologi"
          title="Dibangun dengan Stack Modern"
          description="Teknologi enterprise-grade yang teruji untuk performa, keamanan, dan skalabilitas."
        />

        <div className="flex flex-wrap justify-center gap-4">
          {TECH_STACK.map(({ name, role, color }, i) => (
            <Reveal key={name} delay={i * 0.06}>
              <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <span className={`h-1 w-10 rounded-full bg-gradient-to-r ${color}`} />
                <span className="mt-4 text-base font-bold text-white">{name}</span>
                <span className="mt-1 text-xs text-slate-400">{role}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}