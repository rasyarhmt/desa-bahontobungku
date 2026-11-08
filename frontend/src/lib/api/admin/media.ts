import { http } from "../client";
import { AnyDataSchema, MediaListSchema, MediaSchema, type Media } from "../schemas";
import { getMediaUrl, getVideoThumbnail, inferCreatedAt } from "../mappers";

// ============================================================================
// Admin: media
// ============================================================================

export const adminMediaApi = {
  getAllMedia: async (): Promise<Media[]> => {
    const list = await http.getOr("/v1/media/", MediaListSchema, []);
    return list.map((item) => ({ ...item, created_at: inferCreatedAt(item) }));
  },

  getMediaById: async (id: number | string): Promise<Media | null> => {
    try {
      const item = await http.get(`/v1/media/${id}`, MediaSchema);
      return { ...item, created_at: inferCreatedAt(item) };
    } catch {
      return null;
    }
  },

  addMedia: (formData: FormData) =>
    http.postForm("/v1/media/", formData, AnyDataSchema),

  updateMedia: (id: number | string, formData: FormData) =>
    http.putForm(`/v1/media/${id}`, formData, AnyDataSchema),

  deleteMedia: (id: number | string) => http.delete(`/v1/media/${id}`, AnyDataSchema),
};

export const adminMediaUtils = {
  getMediaUrl,
  getVideoThumbnail,

  getFileType: (filename?: string | null): string => {
    if (!filename) return "unknown";
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
      return "image";
    if (["mp4", "webm", "ogg", "mkv"].includes(extension)) return "video";
    if (extension === "pdf") return "pdf";
    return "unknown";
  },
};
