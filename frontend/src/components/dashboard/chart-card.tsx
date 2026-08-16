"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "gold-hairline relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-row items-center justify-between px-5 pb-2 pt-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-5 pb-5 pt-2">{children}</div>
    </div>
  );
}
