import { http } from "../client";
import {
  AnyDataSchema,
  StatusKeluargaListSchema,
  StatusKeluargaSchema,
  type StatusKeluarga,
} from "../schemas";

// ============================================================================
// Admin: status keluarga
// ============================================================================

export type { StatusKeluarga };

export const adminStatusKeluargaApi = {
  getAll: (includeInactive = false): Promise<StatusKeluarga[]> =>
    http.getOr(
      "/v1/status-keluarga/",
      StatusKeluargaListSchema,
      [],
      includeInactive ? { include_inactive: true } : undefined,
    ),

  getById: async (id: number | string): Promise<StatusKeluarga | null> => {
    try {
      return await http.get(`/v1/status-keluarga/${id}`, StatusKeluargaSchema);
    } catch {
      return null;
    }
  },

  add: async (nama: string): Promise<StatusKeluarga> =>
    http.post(
      "/v1/status-keluarga/",
      { nama },
      StatusKeluargaSchema,
    ),

  update: (id: number | string, nama: string) =>
    http.put(`/v1/status-keluarga/${id}`, { nama }, AnyDataSchema),

  toggleActive: (id: number | string) =>
    http.put(
      `/v1/status-keluarga/${id}/toggle-active`,
      null,
      AnyDataSchema,
    ),

  remove: (id: number | string) =>
    http.delete(`/v1/status-keluarga/${id}`, AnyDataSchema),
};
