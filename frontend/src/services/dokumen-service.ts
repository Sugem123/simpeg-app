import { get, post, del } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Dokumen } from "@/types";

export const dokumenService = {
  getByPegawai(pegawaiId: string, params?: Record<string, unknown>) {
    return get<PaginatedResponse<Dokumen>>(`/pegawai/${pegawaiId}/dokumen`, { params });
  },

  upload(pegawaiId: string, formData: FormData) {
    return post<ApiResponse<Dokumen>>(`/pegawai/${pegawaiId}/dokumen`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getById(id: string) {
    return get<ApiResponse<Dokumen>>(`/dokumen/${id}`);
  },

  update(id: string, formData: FormData) {
    return post<ApiResponse<Dokumen>>(`/dokumen/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete(id: string) {
    return del<ApiResponse<null>>(`/dokumen/${id}`);
  },

  getDownloadUrl(id: string) {
    return `/api/v1/dokumen/${id}/download`;
  },
};
