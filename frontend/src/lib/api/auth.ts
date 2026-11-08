import { AUTH_STORAGE, ApiError, clearAuth, getAccessToken, http, setTokens } from "./client";
import {
  AnyDataSchema,
  LoginResponseSchema,
  type LoginResponse,
} from "./schemas";

export interface LoginResult {
  success: true;
  token: string;
  user?: LoginResponse["user"];
}

/** Akses autentikasi admin (berbasis native fetch + Zod). */
export const authApi = {
  async login(email: string, password: string): Promise<LoginResult> {
    const res = await http.post<LoginResponse>(
      "/v1/auth/login",
      { email, password },
      LoginResponseSchema,
    );

    if (!res.access_token) {
      throw new ApiError("Token tidak ditemukan dalam response!");
    }

    setTokens({ access_token: res.access_token, refresh_token: res.refresh_token });
    localStorage.setItem(AUTH_STORAGE.userEmail, email);
    localStorage.setItem(AUTH_STORAGE.userNama, res.user?.nama ?? "");
    localStorage.setItem(AUTH_STORAGE.userRole, res.user?.role ?? "");

    return {
      success: true,
      token: res.access_token,
      user: res.user,
    };
  },

  /** Logout dengan revoke refresh token di backend. */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(AUTH_STORAGE.refreshToken);
    try {
      if (refreshToken) {
        await http.post(
          "/v1/auth/logout",
          { refresh_token: refreshToken },
          AnyDataSchema,
        );
      }
    } catch (_error) {
      // Tetap bersihkan sesi meski gagal revoke di backend
    } finally {
      clearAuth();
    }
  },

  /** Kirim permintaan reset password via email. */
  async resetPassword(email: string): Promise<unknown> {
    return http.post<unknown>(
      "/v1/auth/reset-password",
      { email },
      AnyDataSchema,
    );
  },
};