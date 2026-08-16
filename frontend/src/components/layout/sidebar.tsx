"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";
import { useSchool } from "@/hooks/use-school";
import { useAuth } from "@/hooks/use-auth";
import { BRAND } from "@/lib/constants/landing";
import {
  LayoutDashboard,
  Users,
  Database,
  FileText,
  Mail,
  CalendarOff,
  BarChart3,
  Settings,
  UserRound,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Types ──────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  roles?: string[];
  /** "data-saya" resolves href dynamically to the logged-in user's own record. */
  dynamic?: "data-saya";
  children?: NavSubItem[];
}

interface NavSubItem {
  label: string;
  href: string;
  roles?: string[];
}

// ─── Navigation Config ─────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Pegawai",
    href: "/pegawai",
    icon: Users,
    roles: ["Super Admin", "Fasilitator"],
  },
  {
    label: "Data Saya",
    dynamic: "data-saya",
    icon: UserRound,
    roles: ["Individu"],
  },
  {
    label: "Master Data",
    icon: Database,
    roles: ["Super Admin", "Fasilitator"],
    children: [
      { label: "Jabatan", href: "/master-data?tab=jabatan" },
      { label: "Pangkat", href: "/master-data?tab=pangkat" },
      { label: "Golongan", href: "/master-data?tab=golongan" },
      { label: "Status Kepegawaian", href: "/master-data?tab=status-kepegawaian" },
      { label: "Jenis Pegawai", href: "/master-data?tab=jenis-pegawai" },
      { label: "Unit Kerja", href: "/master-data?tab=unit-kerja" },
      { label: "Agama", href: "/master-data?tab=agama" },
      { label: "Pendidikan", href: "/master-data?tab=pendidikan" },
      { label: "Mata Pelajaran", href: "/master-data?tab=mata-pelajaran" },
    ],
  },
  {
    label: "Dokumen",
    href: "/dokumen",
    icon: FileText,
    roles: ["Super Admin", "Fasilitator"],
  },
  {
    label: "Surat",
    href: "/surat",
    icon: Mail,
  },
  {
    label: "Cuti",
    href: "/cuti",
    icon: CalendarOff,
  },
  {
    label: "Laporan",
    href: "/laporan",
    icon: BarChart3,
    roles: ["Super Admin", "Fasilitator"],
  },
  {
    label: "Pengaturan",
    icon: Settings,
    roles: ["Super Admin"],
    children: [
      { label: "Pengguna", href: "/pengaturan/users" },
      { label: "Role & Hak Akses", href: "/pengaturan/roles" },
      { label: "Profil Sekolah", href: "/pengaturan/profil-sekolah" },
      { label: "Sync eMaster BKD", href: "/pengaturan/sync-emaster" },
    ],
  },
];

// ─── Sidebar Component ─────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { canAccess, isIndividuOnly } = usePermission();
  const { user } = useAuth();
  const { data: schoolData } = useSchool();

  // Resolve dynamic items (e.g. "Data Saya" -> own record) and inject hrefs.
  const resolvedItems: NavItem[] = NAV_ITEMS.map((item) => {
    if (item.dynamic === "data-saya") {
      return { ...item, href: `/pegawai/${user?.pegawai_id ?? ""}` };
    }
    return item;
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-dvh flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="relative flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
        <div className="relative flex size-10 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-amber-400/20 blur-md" />
          <div className="relative flex size-10 items-center justify-center rounded-xl border border-amber-400/30 bg-gradient-to-b from-white/10 to-white/5 p-1.5">
            <Image
              src={schoolData?.data?.logo_url || BRAND.logoPath}
              alt={schoolData?.data?.nama || BRAND.school}
              width={28}
              height={28}
              className="size-7 object-contain"
              unoptimized={!!schoolData?.data?.logo_url}
            />
          </div>
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate font-heading text-base font-bold tracking-tight text-gold-gradient">
              {BRAND.name}
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              {schoolData?.data?.nama || BRAND.school}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-3">
          {resolvedItems.map((item) => {
            // "Data Saya" is exclusively for pure Individu users.
            if (item.dynamic === "data-saya") {
              if (!isIndividuOnly() || !item.href) return null;
            } else if (!canAccess(item.roles)) {
              return null;
            }

            if (item.children) {
              return (
                <NavGroup
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                  canAccess={canAccess}
                />
              );
            }

            return (
              <NavLink
                key={item.label}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-amber-400/20 hover:text-amber-300"
        >
          {collapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              <span>Ciutkan</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// ─── Nav Link ───────────────────────────────────────────────────

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + "/")
    : false;
  const Icon = item.icon;

  return (
    <Link
      href={item.href || "#"}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_rgba(251,191,36,0.15),0_0_20px_rgba(251,191,36,0.08)]"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {/* Active gold indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          isActive
            ? "text-amber-400"
            : "text-muted-foreground group-hover:text-sidebar-foreground"
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

// ─── Nav Group (collapsible) ────────────────────────────────────

function NavGroup({
  item,
  pathname,
  collapsed,
  canAccess,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  canAccess: (roles?: string[]) => boolean;
}) {
  const [open, setOpen] = useState(
    () =>
      item.children?.some((child) =>
        pathname.startsWith(child.href.split("?")[0])
      ) ?? false
  );
  const Icon = item.icon;
  const isGroupActive =
    item.children?.some((child) =>
      pathname.startsWith(child.href.split("?")[0])
    ) ?? false;

  if (collapsed) {
    return (
      <button
        title={item.label}
        className={cn(
          "group relative flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isGroupActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        {isGroupActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-600" />
        )}
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            isGroupActive ? "text-amber-400" : "text-muted-foreground"
          )}
        />
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isGroupActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        {isGroupActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        )}
        <Icon
          className={cn(
            "size-[18px] shrink-0 transition-colors",
            isGroupActive
              ? "text-amber-400"
              : "text-muted-foreground group-hover:text-sidebar-foreground"
          )}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="mt-1 flex flex-col gap-0.5 pl-[30px]">
          {item.children
            ?.filter((child) => canAccess(child.roles))
            .map((child) => {
              const childBase = child.href.split("?")[0];
              const isChildActive =
                pathname === childBase || pathname.startsWith(childBase + "/");
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[13px] transition-colors",
                    isChildActive
                      ? "bg-sidebar-accent font-medium text-amber-300"
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {child.label}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
