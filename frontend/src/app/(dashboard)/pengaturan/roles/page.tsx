"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  Lock,
} from "lucide-react";
import type { ApiResponse, Role } from "@/types";

export default function RolesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["roles"],
    queryFn: () => get<ApiResponse<Role[]>>("/roles"),
    staleTime: 10 * 60 * 1000,
  });

  const roles = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Role & Hak Akses
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar role dan permission yang tersedia di sistem
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertTriangle className="size-10 text-destructive/60" />
          <p className="text-sm text-muted-foreground">
            Gagal memuat data role. Periksa koneksi ke server.
          </p>
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Shield className="size-10 text-muted-foreground/40" />
          <div>
            <p className="font-medium text-muted-foreground">
              Belum ada data role
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Jalankan seeder untuk membuat role default
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="rounded-2xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{role.nama}</CardTitle>
                    <CardDescription>
                      {role.deskripsi || "Tidak ada deskripsi"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-3.5" />
                    <span>
                      {role.permissions?.length ?? 0} permission
                    </span>
                  </div>
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.map((perm) => (
                        <Badge
                          key={perm.id}
                          variant="secondary"
                          className="text-[11px]"
                        >
                          {perm.nama}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/70">
                      Tidak ada permission terdaftar
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
