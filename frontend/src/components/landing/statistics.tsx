"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { STATISTICS } from "@/lib/constants/landing";
import { Reveal } from "./motion";

// ─── Animated Counter ───────────────────────────────────────────

function Counter({ value, duration = 1.6 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;
    let start: number | null = null;
    let raf: number;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString("id-ID")}
    </span>
  );
}

// ─── Statistics Ribbon ──────────────────────────────────────────

export function Statistics() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATISTICS.map(({ icon: Icon, label, value, suffix, trend }) => (
              <div
                key={label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_8px_40px_rgba(220,165,50,0.15)]"
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 ring-1 ring-amber-400/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.3)]">
                  <Icon className="size-7 text-amber-400" />
                </div>
                <p className="mt-4 font-heading text-3xl font-extrabold text-white sm:text-4xl">
                  <Counter value={value} />
                  <span className="ml-1 text-sm font-semibold text-amber-300">
                    {suffix}
                  </span>
                </p>
                <p className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-xs font-medium text-emerald-400">{trend}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}