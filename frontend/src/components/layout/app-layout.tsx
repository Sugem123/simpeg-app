"use client";

import { useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { BRAND } from "@/lib/constants/landing";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isLoading, isInitialized } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persist sidebar state
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setSidebarCollapsed(true);
  }, []);

  function toggleSidebar() {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  // Premium loading screen
  if (!isInitialized || isLoading) {
    return (
      <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[#070D1B]">
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-amber-400/10 blur-[100px]" />
        <div className="relative flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-white/5 p-3">
              <Image
                src={BRAND.logoPath}
                alt={BRAND.school}
                width={40}
                height={40}
                className="size-10 object-contain"
                priority
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-heading text-xl font-bold tracking-tight text-gold-gradient">
              {BRAND.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {BRAND.school}
            </span>
          </div>
          <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-[#D9A036] via-[#F5C542] to-[#B87C1E]" />
          </div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] border-sidebar-border bg-sidebar p-0">
          <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div
        className={cn(
          "relative flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[68px]" : "lg:ml-[260px]"
        )}
      >
        {/* Subtle ambient glow */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[400px] overflow-hidden">
          <div className="absolute -top-52 left-1/4 h-[400px] w-[500px] rounded-full bg-blue-600/8 blur-[140px]" />
          <div className="absolute -top-32 right-1/4 h-[300px] w-[300px] rounded-full bg-amber-400/5 blur-[120px]" />
        </div>

        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setMobileOpen(true)}
        />
        <main className="relative z-10 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
