import { get, post, patch, del } from "@/lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  MasterData,
  MasterQueryParams,
} from "@/types";

export type MasterType =
  | "jabatan"
  | "pangkat"
  | "golongan"
  | "status-kepegawaian"
  | "jenis-pegawai"
  | "unit-kerja"
  | "agama"
  | "pendidikan"
  | "mata-pelajaran";

export const masterService = {
  getMasterData(type: MasterType, params?: MasterQueryParams) {
    return get<PaginatedResponse<MasterData>>(`/master/${type}`, { params });
  },

  getMasterDataById(type: MasterType, id: string) {
    return get<ApiResponse<MasterData>>(`/master/${type}/${id}`);
  },

  createMaster(type: MasterType, data: Partial<MasterData>) {
    return post<ApiResponse<MasterData>>(`/master/${type}`, data);
  },

  updateMaster(type: MasterType, id: string, data: Partial<MasterData>) {
    return patch<ApiResponse<MasterData>>(`/master/${type}/${id}`, data);
  },

  deleteMaster(type: MasterType, id: string) {
    return del<ApiResponse<null>>(`/master/${type}/${id}`);
  },

  /** Fetch all items for a master type (no pagination, for dropdowns) */
  getAllMasterData(type: MasterType) {
    return get<ApiResponse<MasterData[]>>(`/master/${type}`, {
      params: { per_page: 999 },
    });
  },
};
