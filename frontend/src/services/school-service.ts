import { get, post } from "@/lib/api";
import type { ApiResponse, SchoolProfile } from "@/types";

export const schoolService = {
  get: () => get<ApiResponse<SchoolProfile>>("/pengaturan-sekolah"),

  // Public endpoint (no auth) for landing & login pages
  getPublic: () => get<ApiResponse<SchoolProfile>>("/sekolah"),

  // POST instead of PUT — Cloudflare WAF blocks PUT through the tunnel
  update: (data: Partial<SchoolProfile>) =>
    post<ApiResponse<SchoolProfile>>("/pengaturan-sekolah", data),

  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return post<ApiResponse<SchoolProfile>>("/pengaturan-sekolah/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
