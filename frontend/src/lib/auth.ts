import { AUTH_STORAGE, getAccessToken } from "@/lib/api/client";

export interface AuthState {
  token: string | null;
  nama: string | null;
  email: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

/** Baca identitas sesi dari penyimpanan klien. */
export const getAuthState = (): AuthState => {
  const token = getAccessToken();
  return {
    token,
    nama: localStorage.getItem(AUTH_STORAGE.userNama),
    email: localStorage.getItem(AUTH_STORAGE.userEmail),
    role: localStorage.getItem(AUTH_STORAGE.userRole),
    isAuthenticated: Boolean(token),
  };
};
