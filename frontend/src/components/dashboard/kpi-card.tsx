"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color: "gold" | "blue" | "green" | "orange" | "purple" | "sky" | "rose" | "amber";
  className?: string;
}

const colorMap = {
  gold: {
    icon: "bg-gradient-to-br from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-[#1A1207] shadow-[0_4px_20px_rgba(251,191,36,0.35)]",
    glow: "bg-amber-400/15",
    accent: "text-amber-400",
  },
  blue: {
    icon: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20",
    glow: "bg-blue-500/10",
    accent: "text-blue-400",
  },
  green: {
    icon: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20",
    glow: "bg-emerald-500/10",
    accent: "text-emerald-400",
  },
  orange: {
    icon: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-400/20",
    glow: "bg-orange-500/10",
    accent: "text-orange-400",
  },
  purple: {
    icon: "bg-violet-500/15 text-violet-400 ring-1 ring-violet-400/20",
    glow: "bg-violet-500/10",
    accent: "text-violet-400",
  },
  sky: {
    icon: "bg-sky-500/15 text-sky-400 ring-1 ring-sky-400/20",
    glow: "bg-sky-500/10",
    accent: "text-sky-400",
  },
  rose: {
    icon: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-400/20",
    glow: "bg-rose-500/10",
    accent: "text-rose-400",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/20",
    glow: "bg-amber-500/10",
    accent: "text-amber-400",
  },
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  color,
  className,
}: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/25 hover:bg-white/[0.06] hover:shadow-[0_8px_30px_rgba(0,0,0,0.35),0_0_24px_rgba(251,191,36,0.08)]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-muted-foreground">
            {label}
          </span>
          <span className="font-heading text-3xl font-bold tracking-tight text-foreground">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </span>
          {trend && (
            <span
              className={cn(
                "mt-0.5 inline-flex items-center gap-1 text-xs font-semibold",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            colors.icon
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {/* Decorative glow */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -right-8 size-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100",
          colors.glow,
          "opacity-60"
        )}
      />
    </div>
  );
}
