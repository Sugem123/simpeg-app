import { get, post, patch } from "@/lib/api";
import type { ApiResponse, RiwayatType } from "@/types";

export const riwayatService = {
  getByPegawai<T>(pegawaiId: string, type: RiwayatType) {
    return get<ApiResponse<T[]>>(`/pegawai/${pegawaiId}/riwayat/${type}`);
  },

  create<T>(pegawaiId: string, type: RiwayatType, data: Record<string, unknown>) {
    return post<ApiResponse<T>>(`/pegawai/${pegawaiId}/riwayat/${type}`, data);
  },

  update<T>(pegawaiId: string, type: RiwayatType, id: string, data: Record<string, unknown>) {
    return patch<ApiResponse<T>>(`/pegawai/${pegawaiId}/riwayat/${type}/${id}`, data);
  },
};
