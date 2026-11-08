import { http } from "../client";
import {
  AnyDataSchema,
  PengumumanListSchema,
  PengumumanSchema,
} from "../schemas";
import { normalizePengumuman } from "../mappers";

// ============================================================================
// Admin: pengumuman (camel view tanggalMulai/tanggalSelesai)
// ============================================================================

export interface PengumumanAdminView {
  id: number;
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

const toPengumumanCreate = (data: {
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}) => ({
  judul: data.judul,
  isi: data.isi,
  tanggal_mulai: data.tanggalMulai,
  tanggal_selesai: data.tanggalSelesai,
});

export const adminPengumumanApi = {
  getAllPengumuman: async (): Promise<PengumumanAdminView[]> => {
    const list = await http.getOr("/v1/pengumuman/", PengumumanListSchema, []);
    return list.map(normalizePengumuman);
  },

  getPengumumanById: async (
    id: number | string,
  ): Promise<PengumumanAdminView | null> => {
    try {
      const item = await http.get(`/v1/pengumuman/${id}`, PengumumanSchema);
      return normalizePengumuman(item);
    } catch {
      return null;
    }
  },

  addPengumuman: (data: Parameters<typeof toPengumumanCreate>[0]) =>
    http.post("/v1/pengumuman/", toPengumumanCreate(data), AnyDataSchema),

  updatePengumuman: (
    id: number | string,
    data: Parameters<typeof toPengumumanCreate>[0],
  ) =>
    http.put(`/v1/pengumuman/${id}`, toPengumumanCreate(data), AnyDataSchema),

  deletePengumuman: (id: number | string) =>
    http.delete(`/v1/pengumuman/${id}`, AnyDataSchema),
};
