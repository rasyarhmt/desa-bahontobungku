import { ApiError } from "./api/client";

/** Pesan error yang aman ditampilkan ke pengguna (mendukung ApiError dari klien). */
export const getErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): string => {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};
