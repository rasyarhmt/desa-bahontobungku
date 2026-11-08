import { http } from "./client";
import {
  AjukanSuratRequestSchema,
  AjukanSuratSchema,
  AnyDataSchema,
  LogCetakSuratListSchema,
  LogCetakSuratSchema,
  LogCetakVerifikasiSchema,
  PelayananListSchema,
  PelayananSchema,
  TemplateFieldsSchema,
  type AjukanSuratRequest,
  type AjukanSuratResponse,
  type LogCetakSurat,
  type LogCetakVerifikasi,
  type Pelayanan,
  type TemplateField,
} from "./schemas";

/** Klien publik & terbuka untuk modul pelayanan/cetak surat. */
export const pelayananApi = {
  getAllPelayanan: async (): Promise<Pelayanan[]> => {
    try {
      return await http.get<Pelayanan[]>("/v1/pelayanan/", PelayananListSchema);
    } catch (error) {
      console.error("Error fetching pelayanan:", error);
      return [];
    }
  },

  getPelayananById: async (id: number | string): Promise<Pelayanan | null> => {
    try {
      return await http.get<Pelayanan>(`/v1/pelayanan/${id}`, PelayananSchema);
    } catch (error) {
      console.error("Error fetching pelayanan:", error);
      return null;
    }
  },

  /** Ajukan pembuatan surat dari pelayanan (warga). */
  ajukanSurat: async (
    idPelayanan: number | string,
    payload: AjukanSuratRequest,
  ): Promise<AjukanSuratResponse> => {
    const validPayload = AjukanSuratRequestSchema.parse(payload);
    return http.post<AjukanSuratResponse>(
      `/v1/pelayanan/${idPelayanan}/surat`,
      validPayload,
      AjukanSuratSchema,
    );
  },

  /** Field placeholder {{ key }} milik template pelayanan (publik). */
  getTemplateFields: async (
    idPelayanan: number | string,
  ): Promise<TemplateField[]> => {
    try {
      return await http.get<TemplateField[]>(
        `/v1/pelayanan/${idPelayanan}/surat/fields`,
        TemplateFieldsSchema,
      );
    } catch (error) {
      console.error("Error fetching template fields:", error);
      return [];
    }
  },

  /** Verifikasi keaslian surat via kode unik (publik). */
  verifikasiSurat: async (kodeUnik: string): Promise<LogCetakVerifikasi> =>
    http.get<LogCetakVerifikasi>(
      `/v1/log-cetak-surat/verifikasi/${kodeUnik}`,
      LogCetakVerifikasiSchema,
    ),
};

/** Akses log cetak surat (admin). */
export const logCetakApi = {
  getAll: async (): Promise<LogCetakSurat[]> =>
    http.get<LogCetakSurat[]>("/v1/log-cetak-surat", LogCetakSuratListSchema),

  getById: async (id: number | string): Promise<LogCetakSurat> =>
    http.get<LogCetakSurat>(`/v1/log-cetak-surat/${id}`, LogCetakSuratSchema),

  getByKode: async (kodeUnik: string): Promise<LogCetakSurat> =>
    http.get<LogCetakSurat>(
      `/v1/log-cetak-surat/kode/${kodeUnik}`,
      LogCetakSuratSchema,
    ),

  resmikan: async (
    id: number | string,
    payload: { nomor_surat: string },
  ): Promise<LogCetakSurat> =>
    http.post<LogCetakSurat>(
      `/v1/log-cetak-surat/${id}/resmikan`,
      payload,
      LogCetakSuratSchema,
    ),

  /** Hapus log cetak (admin) — data kosong, cukup cek sukses. */
  delete: async (id: number | string): Promise<void> => {
    await http.delete<unknown>(`/v1/log-cetak-surat/${id}`, AnyDataSchema);
  },
};
