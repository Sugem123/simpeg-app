import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken, getRefreshToken, setTokens, removeTokens } from "./auth";

const BASE_URL = "/api/v1";

// ─── Axios Instance ─────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

// ─── Request Interceptor ───────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for login/refresh endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data?.access_token ?? data.access_token;
        const newRefreshToken =
          data.data?.refresh_token ?? data.refresh_token ?? refreshToken;

        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Helper Methods ─────────────────────────────────────────────

export async function get<T>(url: string, config?: AxiosRequestConfig) {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

// Cloudflare WAF memblokir method PATCH/PUT/DELETE pada domain publik.
// Spoof sebagai POST dengan header X-HTTP-Method-Override
// (didukung native oleh Laravel/Symfony HttpFoundation).
function spoofMethod(
  method: "PATCH" | "PUT" | "DELETE",
  config?: AxiosRequestConfig
): AxiosRequestConfig {
  return {
    ...config,
    headers: {
      ...config?.headers,
      "X-HTTP-Method-Override": method,
    },
  };
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const response = await api.post<T>(url, data, spoofMethod("PATCH", config));
  return response.data;
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  const response = await api.post<T>(url, data, spoofMethod("PUT", config));
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig) {
  const response = await api.post<T>(
    url,
    config?.data,
    spoofMethod("DELETE", config)
  );
  return response.data;
}

export { api };
export default api;
