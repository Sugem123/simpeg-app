import { get } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, AuditLog, AuditQueryParams } from "@/types";

export const auditService = {
  getAll(params?: AuditQueryParams) {
    return get<PaginatedResponse<AuditLog>>("/audit", { params });
  },

  getById(id: string) {
    return get<ApiResponse<AuditLog>>(`/audit/${id}`);
  },
};
