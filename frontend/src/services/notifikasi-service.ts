import { get, patch } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Notifikasi } from "@/types";

export const notifikasiService = {
  getAll(params?: { page?: number; per_page?: number }) {
    return get<PaginatedResponse<Notifikasi>>("/notifications", { params });
  },

  getUnreadCount() {
    return get<ApiResponse<{ count: number }>>("/notifications/unread-count");
  },

  markAsRead(id: string) {
    return patch<ApiResponse<Notifikasi>>(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return patch<ApiResponse<null>>("/notifications/read-all");
  },
};
