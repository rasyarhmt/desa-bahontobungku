import { http } from "./client";
import {
  APBDesDetailSchema,
  APBDesSummarySchema,
  DanaKeluarListSchema,
  DanaMasukListSchema,
  type APBDesDetail,
  type APBDesSummary,
  type DanaKeluar,
  type DanaMasuk,
} from "./schemas";

export const apbdesApi = {
  getAllDanaMasuk: async (): Promise<DanaMasuk[]> =>
    http.get("/v1/dana/apbdes/dana-masuk", DanaMasukListSchema),

  getAllDanaKeluar: async (): Promise<DanaKeluar[]> =>
    http.get("/v1/dana/apbdes/dana-keluar", DanaKeluarListSchema),

  getAPBDesSummary: async (tahun: number): Promise<APBDesSummary> => {
    try {
      return await http.get(`/v1/dana/apbdes/summary/${tahun}`, APBDesSummarySchema);
    } catch {
      return [];
    }
  },

  getAPBDesDetail: async (tahun: number): Promise<APBDesDetail> => {
    try {
      return await http.get(`/v1/dana/apbdes/detail/${tahun}`, APBDesDetailSchema);
    } catch {
      return { pendapatan: [], pengeluaran: [] };
    }
  },

  getAvailableYears: async (): Promise<number[]> => {
    try {
      const [danaMasuk, danaKeluar] = await Promise.all([
        apbdesApi.getAllDanaMasuk(),
        apbdesApi.getAllDanaKeluar(),
      ]);
      const years = new Set<number>();
      danaMasuk.forEach((item) => years.add(item.tahun));
      danaKeluar.forEach((item) => years.add(item.tahun));
      return Array.from(years).sort((a, b) => b - a);
    } catch {
      return [];
    }
  },
};