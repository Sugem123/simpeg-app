import { get, post, patch, del } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Cuti, CutiQueryParams } from "@/types";

export const cutiService = {
  getAll(params?: CutiQueryParams) {
    return get<PaginatedResponse<Cuti>>("/cuti", { params });
  },

  getById(id: string) {
    return get<ApiResponse<Cuti>>(`/cuti/${id}`);
  },

  create(data: Partial<Cuti>) {
    return post<ApiResponse<Cuti>>("/cuti", data);
  },

  update(id: string, data: Partial<Cuti>) {
    return patch<ApiResponse<Cuti>>(`/cuti/${id}`, data);
  },

  delete(id: string) {
    return del<ApiResponse<null>>(`/cuti/${id}`);
  },

  approve(id: string, catatan?: string) {
    return patch<ApiResponse<Cuti>>(`/cuti/${id}/approve`, { catatan_approval: catatan });
  },

  reject(id: string, catatan: string) {
    return patch<ApiResponse<Cuti>>(`/cuti/${id}/reject`, { catatan_approval: catatan });
  },
};
