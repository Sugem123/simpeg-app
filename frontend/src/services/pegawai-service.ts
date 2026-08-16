import { get, post, patch, del } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  Pegawai,
  PegawaiQueryParams,
} from "@/types";

export const pegawaiService = {
  getPegawai(params?: PegawaiQueryParams) {
    return get<PaginatedResponse<Pegawai>>("/pegawai", { params });
  },

  getPegawaiById(id: string) {
    return get<ApiResponse<Pegawai>>(`/pegawai/${id}`);
  },

  createPegawai(data: Partial<Pegawai>) {
    return post<ApiResponse<Pegawai>>("/pegawai", data);
  },

  updatePegawai(id: string, data: Partial<Pegawai>) {
    return patch<ApiResponse<Pegawai>>(`/pegawai/${id}`, data);
  },

  deletePegawai(id: string) {
    return del<ApiResponse<null>>(`/pegawai/${id}`);
  },

  searchPegawai(query: string) {
    return get<ApiResponse<Pegawai[]>>("/pegawai-search", {
      params: { q: query },
    });
  },
};
