"use client";

import { create } from "zustand";
import type { User } from "@/types";
import type { LoginRequest } from "@/types/auth";
import { authService } from "@/services/auth-service";
import { setTokens, removeTokens, isAuthenticated } from "@/lib/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      const { access_token, refresh_token, user } = response.data;
      setTokens(access_token, refresh_token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors - still clear local state
    } finally {
      removeTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  checkAuth: async () => {
    if (!isAuthenticated()) {
      set({ user: null, isAuthenticated: false });
      return;
    }
    try {
      const response = await authService.me();
      set({ user: response.data, isAuthenticated: true });
    } catch {
      removeTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  initialize: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });
    try {
      await get().checkAuth();
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },
}));
