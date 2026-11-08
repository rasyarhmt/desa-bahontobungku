import { http } from "./client";
import { MediaListSchema, MediaSchema, type Media } from "./schemas";
import { getMediaUrl, getVideoThumbnail, inferCreatedAt } from "./mappers";

export const mediaApi = {
  getAllMedia: async (): Promise<Media[]> => {
    const parsed = await http.getOr("/v1/media/", MediaListSchema, []);
    return parsed.map((item) => ({ ...item, created_at: inferCreatedAt(item) }));
  },

  getMediaById: async (id: number): Promise<Media | null> => {
    try {
      const item = await http.get(`/v1/media/${id}`, MediaSchema);
      return { ...item, created_at: inferCreatedAt(item) };
    } catch {
      return null;
    }
  },
};

export const mediaUtils = {
  getMediaUrl,
  getVideoThumbnail,

  extractYear: (item: Media): string => {
    const date = new Date(item.created_at ?? "");
    if (!Number.isNaN(date.getTime())) return date.getFullYear().toString();
    if (item.created_at && item.created_at.length >= 4) {
      return item.created_at.substring(0, 4);
    }
    if (item.file) {
      const possibleTimestamp = Number.parseInt(item.file.split(".")[0], 10);
      if (!Number.isNaN(possibleTimestamp)) {
        return new Date(possibleTimestamp).getFullYear().toString();
      }
    }
    return new Date().getFullYear().toString();
  },
};
