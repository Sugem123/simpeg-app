import { post } from "@/lib/api";

export interface EmasterSyncResult {
  created?: number;
  updated?: number;
  skipped?: number;
  total_fetched?: number;
  pegawai_updated?: number;
  diklat_created?: number;
  photos_downloaded?: number;
  documents_downloaded?: number;
  pangkat_created?: number;
  jabatan_created?: number;
  pendidikan_created?: number;
  errors?: string[];
  basic?: EmasterSyncResult;
  batch?: EmasterSyncResult;
  documents?: EmasterSyncResult;
  details?: EmasterSyncResult;
  [key: string]: unknown;
}

export interface EmasterSyncResponse {
  success: boolean;
  message: string;
  data: EmasterSyncResult | null;
}

export type SyncType = "sync" | "sync-batch" | "sync-documents" | "sync-details" | "sync-all";

export const emasterService = {
  sync() {
    return post<EmasterSyncResponse>("/emaster/sync", {});
  },
  syncBatch() {
    return post<EmasterSyncResponse>("/emaster/sync-batch", {});
  },
  syncDocuments() {
    return post<EmasterSyncResponse>("/emaster/sync-documents", {});
  },
  syncDetails() {
    return post<EmasterSyncResponse>("/emaster/sync-details", {});
  },
  syncAll() {
    return post<EmasterSyncResponse>("/emaster/sync-all", {});
  },
};
