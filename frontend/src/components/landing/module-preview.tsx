"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MODULE_PREVIEWS } from "@/lib/constants/landing";
import { Reveal, SectionHeading } from "./motion";

export function ModulePreview() {
  const [active, setActive] = useState(MODULE_PREVIEWS[0].id);
  const current = MODULE_PREVIEWS.find((m) => m.id === active)!;

  return (
    <section id="modul" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Preview Modul"
          title="Modul Lengkap untuk Setiap Kebutuhan"
          description="Jelajahi modul-modul unggulan SIMPEG yang dirancang untuk mempermudah administrasi kepegawaian."
        />

        {/* Tabs */}
        <Reveal>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {MODULE_PREVIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  active === id
                    ? "bg-gradient-to-r from-amber-400 to-amber-600 text-[#0B132B] shadow-[0_4px_20px_rgba(220,165,50,0.3)]"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Preview Panel */}
        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur lg:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-blue-600/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-amber-400/10 blur-3xl" />

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
                className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left"
              >
                <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 ring-1 ring-amber-400/30">
                  <current.icon className="size-10 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold text-white">
                    {current.label}
                  </h3>
                  <p className="mt-2 max-w-xl text-slate-400">
                    {current.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}