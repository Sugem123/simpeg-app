import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(TOKEN_KEY, accessToken, {
    expires: 1, // 1 day
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  Cookies.set(REFRESH_KEY, refreshToken, {
    expires: 7, // 7 days
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_KEY);
}

export function removeTokens(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
