import { http } from "./client";
import {
  PengumumanListSchema,
  PengumumanSchema,
  type Pengumuman,
} from "./schemas";
import { normalizePengumuman } from "./mappers";

/** Klien publik untuk modul pengumuman. */
export const pengumumanApi = {
  /** Semua pengumuman yang ACTIVE (tanggal hari ini di antara tanggal_mulai & selesai). */
  getActivePengumuman: async () => {
    try {
      const list = await http.get<Pengumuman[]>(
        "/v1/pengumuman/",
        PengumumanListSchema,
      );
      const currentDate = new Date();
      return list
        .filter((item) => {
          const startDate = new Date(item.tanggal_mulai);
          const endDate = new Date(item.tanggal_selesai);
          return currentDate >= startDate && currentDate <= endDate;
        })
        .map(normalizePengumuman);
    } catch (error) {
      console.error("Error fetching active pengumuman:", error);
      return [];
    }
  },

  /** Pengumuman berdasarkan id. */
  getPengumumanById: async (id: number | string) => {
    try {
      const item = await http.get<Pengumuman>(
        `/v1/pengumuman/${id}`,
        PengumumanSchema,
      );
      return normalizePengumuman(item);
    } catch (error) {
      console.error(`Error fetching pengumuman with id ${id}:`, error);
      return null;
    }
  },
};
