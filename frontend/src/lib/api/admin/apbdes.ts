import { http } from "../client";
import {
  AnyDataSchema,
  DanaKeluarListSchema,
  DanaKeluarSchema,
  DanaMasukListSchema,
  DanaMasukSchema,
} from "../schemas";

// ============================================================================
// Admin: APBDes (dana masuk/keluar CRUD + summary)
// ============================================================================

export const adminApbdesApi = {
  getAllDanaMasuk: async () =>
    http.get("/v1/dana/apbdes/dana-masuk", DanaMasukListSchema),
  getAllDanaKeluar: async () =>
    http.get("/v1/dana/apbdes/dana-keluar", DanaKeluarListSchema),

  getDanaMasukById: async (id: number | string) =>
    http.get(`/v1/dana/apbdes/dana-masuk/${id}`, DanaMasukSchema),

  getDanaKeluarById: async (id: number | string) =>
    http.get(`/v1/dana/apbdes/dana-keluar/${id}`, DanaKeluarSchema),

  addDanaMasuk: (data: unknown) =>
    http.post("/v1/dana/apbdes/dana-masuk", data, AnyDataSchema),

  updateDanaMasuk: (id: number | string, data: unknown) =>
    http.put(
      `/v1/dana/apbdes/dana-masuk/${id}`,
      data,
      AnyDataSchema,
    ),

  deleteDanaMasuk: (id: number | string) =>
    http.delete(`/v1/dana/apbdes/dana-masuk/${id}`, AnyDataSchema),

  addDanaKeluar: (data: unknown) =>
    http.post("/v1/dana/apbdes/dana-keluar", data, AnyDataSchema),

  updateDanaKeluar: (id: number | string, data: unknown) =>
    http.put(
      `/v1/dana/apbdes/dana-keluar/${id}`,
      data,
      AnyDataSchema,
    ),

  deleteDanaKeluar: (id: number | string) =>
    http.delete(`/v1/dana/apbdes/dana-keluar/${id}`, AnyDataSchema),
};
