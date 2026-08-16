import { post, get } from "@/lib/api";
import type { ApiResponse, User } from "@/types";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export const authService = {
  login(data: LoginRequest) {
    return post<ApiResponse<LoginResponse>>("/auth/login", data);
  },

  logout() {
    return post<ApiResponse<null>>("/auth/logout");
  },

  refresh(refreshToken: string) {
    return post<ApiResponse<{ access_token: string; refresh_token: string }>>(
      "/auth/refresh",
      { refresh_token: refreshToken }
    );
  },

  me() {
    return get<ApiResponse<User>>("/auth/me");
  },

  changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    return post<ApiResponse<null>>("/auth/change-password", data);
  },
};
