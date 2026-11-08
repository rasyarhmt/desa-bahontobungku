export const API_URL: string = import.meta.env.VITE_API_URL || "";

/** Origin tanpa suffix /api — dipakai untuk meresolve path file statis (uploads). */
export const API_ORIGIN: string = API_URL
  ? API_URL.replace(/\/api\/?$/, "")
  : "";

export const resolveFileUrl = (path: string): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path}`;
};

/** Resolve path upload backend (relatif `uploads/...`) ke URL absolut. */
export const resolveUploadUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.replace(/^uploads\//, "");
  return `${API_ORIGIN}/uploads/${cleanPath}`;
};