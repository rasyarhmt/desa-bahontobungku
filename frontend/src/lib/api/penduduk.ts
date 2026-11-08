import { http } from "./client";
import {
  StatsCategorySchema,
  StatsTotalSchema,
  type StatsCategory,
} from "./schemas";

export interface PendudukSummary {
  totalPenduduk: number;
  totalKepalaKeluarga: number;
  totalLakiLaki: number;
  totalPerempuan: number;
}

export interface PendudukStatsAll {
  summary: PendudukSummary;
  byAgama: StatsCategory;
  byUmur: StatsCategory;
}

export const pendudukApi = {
  getTotalPenduduk: async (): Promise<number> => {
    try {
      const { total } = await http.get("/v1/penduduk/stats/total", StatsTotalSchema);
      return total;
    } catch {
      return 0;
    }
  },

  getTotalKepalaKeluarga: async (): Promise<number> => {
    try {
      const { total } = await http.get(
        "/v1/penduduk/stats/kepala-keluarga",
        StatsTotalSchema,
      );
      return total;
    } catch {
      return 0;
    }
  },

  getTotalLakiLaki: async (): Promise<number> => {
    try {
      const { total } = await http.get("/v1/penduduk/stats/laki-laki", StatsTotalSchema);
      return total;
    } catch {
      return 0;
    }
  },

  getTotalPerempuan: async (): Promise<number> => {
    try {
      const { total } = await http.get("/v1/penduduk/stats/perempuan", StatsTotalSchema);
      return total;
    } catch {
      return 0;
    }
  },

  getPendudukByAgama: async (): Promise<StatsCategory> =>
    http.getOr("/v1/penduduk/stats/agama", StatsCategorySchema, []),

  getPendudukByUmur: async (): Promise<StatsCategory> =>
    http.getOr("/v1/penduduk/stats/umur", StatsCategorySchema, []),

  getStatsSummary: async (): Promise<PendudukSummary> => {
    try {
      const [total, kepalaKeluarga, lakiLaki, perempuan] = await Promise.all([
        pendudukApi.getTotalPenduduk(),
        pendudukApi.getTotalKepalaKeluarga(),
        pendudukApi.getTotalLakiLaki(),
        pendudukApi.getTotalPerempuan(),
      ]);
      return {
        totalPenduduk: total,
        totalKepalaKeluarga: kepalaKeluarga,
        totalLakiLaki: lakiLaki,
        totalPerempuan: perempuan,
      };
    } catch {
      return {
        totalPenduduk: 0,
        totalKepalaKeluarga: 0,
        totalLakiLaki: 0,
        totalPerempuan: 0,
      };
    }
  },

  getAllStats: async (): Promise<PendudukStatsAll> => {
    const [summary, byAgama, byUmur] = await Promise.all([
      pendudukApi.getStatsSummary(),
      pendudukApi.getPendudukByAgama(),
      pendudukApi.getPendudukByUmur(),
    ]);
    return { summary, byAgama, byUmur };
  },
};