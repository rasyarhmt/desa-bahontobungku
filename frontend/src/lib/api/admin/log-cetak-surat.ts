import { http } from "../client";
import {
  AnyDataSchema,
  LogCetakSuratListSchema,
  LogCetakSuratSchema,
} from "../schemas";

// ============================================================================
// Admin: log cetak surat
// ============================================================================

export const adminLogCetakApi = {
  getAllLogCetak: async () =>
    http.getOr("/v1/log-cetak-surat/", LogCetakSuratListSchema, []),

  getLogCetakById: async (id: number | string) => {
    try {
      return await http.get(`/v1/log-cetak-surat/${id}`, LogCetakSuratSchema);
    } catch {
      return null;
    }
  },

  downloadFile: async (id: number | string): Promise<Blob> =>
    http.getBlob(`/v1/log-cetak-surat/${id}/file`),

  resmikan: (id: number | string, nomorSurat: string) =>
    http.put(
      `/v1/log-cetak-surat/${id}/resmikan`,
      { nomor_surat: nomorSurat },
      AnyDataSchema,
    ),
};
