"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { notifikasiService } from "@/services/notifikasi-service";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Bell, LogOut, User, Settings } from "lucide-react";

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Real unread notification count, refreshed every 30s
  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notifikasiService.getUnreadCount(),
    refetchInterval: 30_000,
    retry: false,
  });
  const unreadCount = unreadData?.data?.count ?? 0;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const initials = user?.pegawai?.nama
    ? user.pegawai.nama
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.username?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/70 px-4 backdrop-blur-xl transition-all duration-300 lg:px-6",
        sidebarCollapsed
          ? "lg:pl-[calc(68px+1.5rem)]"
          : "lg:pl-[calc(260px+1.5rem)]"
      )}
    >
      {/* Left: Mobile sidebar toggle + Breadcrumb */}
      <div className="flex flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <div className="hidden lg:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden rounded-xl border border-white/5 bg-white/[0.03] text-muted-foreground hover:border-amber-400/20 hover:text-amber-300 sm:inline-flex"
        >
          <Search className="size-4" />
          <span className="ml-2 text-xs">Cari...</span>
          <kbd className="ml-3 inline-flex h-5 items-center rounded border border-white/10 bg-white/5 px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-xl text-muted-foreground hover:text-amber-300"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[10px] font-bold text-[#1A1207] shadow-[0_0_8px_rgba(251,191,36,0.5)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/5">
              <Avatar className="size-8 ring-1 ring-amber-400/30">
                <AvatarFallback className="bg-gradient-to-br from-[#D9A036] via-[#F5C542] to-[#B87C1E] text-xs font-bold text-[#1A1207]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-medium leading-tight text-foreground">
                  {user?.pegawai?.nama ?? user?.username ?? "User"}
                </span>
                <span className="text-[11px] text-amber-400/80">
                  {user?.roles?.[0]?.nama ?? "Pegawai"}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/10 bg-popover/95 backdrop-blur-xl"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {user?.pegawai?.nama ?? user?.username}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/profil")}>
                <User className="mr-2 size-4" />
                Profil Saya
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/pengaturan")}>
                <Settings className="mr-2 size-4" />
                Pengaturan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
