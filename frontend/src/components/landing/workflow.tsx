"use client";

import { WORKFLOW_STEPS } from "@/lib/constants/landing";
import { Reveal, SectionHeading } from "./motion";

export function Workflow() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Alur Kerja"
          title="Proses Bisnis yang Efisien"
          description="Dari data pegawai hingga laporan, seluruh alur administrasi berjalan otomatis dan terstruktur."
        />

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {WORKFLOW_STEPS.map(({ icon: Icon, label, description }, i) => (
              <Reveal key={label} delay={i * 0.1}>
                <div className="group flex flex-col items-center text-center">
                  <div className="relative flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-[#0C1526] transition-all duration-300 group-hover:scale-110 group-hover:border-amber-400/60 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                    <Icon className="size-7 text-amber-400" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[10px] font-bold text-[#0B132B]">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white">{label}</h3>
                  <p className="mt-1 text-xs text-slate-400">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}