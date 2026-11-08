import { http } from "../client";
import {
  AnyDataSchema,
  PelayananListSchema,
  PelayananSchema,
} from "../schemas";

// ============================================================================
// Admin: pelayanan
// ============================================================================

export const adminPelayananApi = {
  getAllPelayanan: async () =>
    http.getOr("/v1/pelayanan/", PelayananListSchema, []),

  getPelayananById: async (id: number | string) => {
    try {
      return await http.get(`/v1/pelayanan/${id}`, PelayananSchema);
    } catch {
      return null;
    }
  },

  addPelayanan: (data: {
    nama_layanan: string;
    deskripsi: string;
    status?: string;
    id_surat_template?: number | string | null;
  }) =>
    http.post(
      "/v1/pelayanan/",
      {
        nama_layanan: data.nama_layanan,
        deskripsi: data.deskripsi,
        status: data.status || "aktif",
        ...(data.id_surat_template
          ? { id_surat_template: Number(data.id_surat_template) }
          : {}),
      },
      AnyDataSchema,
    ),

  updatePelayanan: (
    id: number | string,
    data: {
      nama_layanan: string;
      deskripsi: string;
      id_surat_template?: number | string | null;
    },
  ) =>
    http.put(
      `/v1/pelayanan/${id}`,
      {
        nama_layanan: data.nama_layanan,
        deskripsi: data.deskripsi,
        ...(data.id_surat_template
          ? { id_surat_template: Number(data.id_surat_template) }
          : {}),
      },
      AnyDataSchema,
    ),

  toggleStatus: (id: number | string) =>
    http.put(
      `/v1/pelayanan/${id}/toggle-status`,
      null,
      AnyDataSchema,
    ),

  deletePelayanan: (id: number | string) =>
    http.delete(`/v1/pelayanan/${id}`, AnyDataSchema),
};
