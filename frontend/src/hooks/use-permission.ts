"use client";

import { useAuth } from "./use-auth";

export function usePermission() {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.roles?.some((r) => r.nama === role) ?? false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.some(
      (role) =>
        role.permissions?.some((p) => p.nama === permission) ?? false
    );
  };

  const isSuperAdmin = (): boolean => hasRole("Super Admin");
  const isFasilitator = (): boolean => hasRole("Fasilitator");
  const isIndividu = (): boolean => hasRole("Individu");

  /**
   * True only for pure Individu (self-service) users.
   * Super Admin / Fasilitator always bypass self-service restrictions.
   */
  const isIndividuOnly = (): boolean =>
    isIndividu() && !isSuperAdmin() && !isFasilitator();

  /** Admin-level users may manage all pegawai data. */
  const canManagePegawai = (): boolean =>
    isSuperAdmin() || isFasilitator();

  const canAccess = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (isSuperAdmin()) return true;
    return requiredRoles.some((role) => hasRole(role));
  };

  return {
    hasRole,
    hasPermission,
    isSuperAdmin,
    isFasilitator,
    isIndividu,
    isIndividuOnly,
    canManagePegawai,
    canAccess,
  };
}
