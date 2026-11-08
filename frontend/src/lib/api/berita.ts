import { http } from "./client";
import {
  BeritaListSchema,
  BeritaSchema,
  type Berita,
} from "./schemas";

export interface PaginatedBerita {
  berita: Berita[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const EMPTY_PAGINATION: PaginatedBerita = {
  berita: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

const byNewest = (a: Berita, b: Berita): number =>
  Number(new Date(b.tanggal_terbit ?? "")) -
  Number(new Date(a.tanggal_terbit ?? ""));

/** Berita: terbit backend dalam envelope, terurut terbaru. */
export const beritaApi = {
  getAllBerita: async (): Promise<Berita[]> =>
    http.get("/v1/berita/", BeritaListSchema),

  getBeritaByStatus: async (status: string): Promise<Berita[]> =>
    http.getOr(`/v1/berita/status/${status}`, BeritaListSchema, []),

  getPublishedBerita: async (): Promise<Berita[]> =>
    http.get("/v1/berita/status/dipublikasi", BeritaListSchema),

  getBeritaById: async (id: number): Promise<Berita | null> => {
    try {
      return await http.get(`/v1/berita/${id}`, BeritaSchema);
    } catch {
      return null;
    }
  },

  getLatestBerita: async (limit = 3): Promise<Berita[]> =>
    [...(await beritaApi.getPublishedBerita())].sort(byNewest).slice(0, limit),

  getPaginatedBerita: async (
    page = 1,
    limitPerPage = 8,
    status?: string | null,
  ): Promise<PaginatedBerita> => {
    try {
      const all = status
        ? await beritaApi.getBeritaByStatus(status)
        : await beritaApi.getPublishedBerita();
      const sorted = [...all].sort(byNewest);
      const start = (page - 1) * limitPerPage;
      return {
        berita: sorted.slice(start, start + limitPerPage),
        totalItems: sorted.length,
        totalPages: Math.ceil(sorted.length / limitPerPage),
        currentPage: page,
      };
    } catch {
      return EMPTY_PAGINATION;
    }
  },
};