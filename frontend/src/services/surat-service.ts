import { get, post, patch, del } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Surat, SuratQueryParams } from "@/types";

export const suratService = {
  getAll(params?: SuratQueryParams) {
    return get<PaginatedResponse<Surat>>("/surat", { params });
  },

  getById(id: string) {
    return get<ApiResponse<Surat>>(`/surat/${id}`);
  },

  create(data: FormData) {
    return post<ApiResponse<Surat>>("/surat", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update(id: string, data: Partial<Surat>) {
    return patch<ApiResponse<Surat>>(`/surat/${id}`, data);
  },

  delete(id: string) {
    return del<ApiResponse<null>>(`/surat/${id}`);
  },

  getDownloadUrl(id: string) {
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/surat/${id}/download`;
  },
};
