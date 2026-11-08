import { http } from "../client";
import {
  AnyDataSchema,
  BeritaListSchema,
  BeritaSchema,
} from "../schemas";

// ============================================================================
// Admin: berita (view normalized: status "Dipublikasi"/"Draft", snake->camel)
// ============================================================================

export interface BeritaAdminView {
  id: number;
  judul: string;
  isi: string;
  tanggalTerbit: string | null;
  penulis: string;
  status: "Dipublikasi" | "Draft";
  foto: string;
  hasFoto?: boolean;
  createdAt?: string | null;
}

const normalizeBeritaAdmin = (item: {
  id: number;
  judul: string;
  isi: string;
  tanggal_terbit?: string | null;
  penulis?: string;
  status?: string;
  foto?: string | null;
  has_foto?: boolean;
  created_at?: string | null;
}): BeritaAdminView => ({
  id: item.id,
  judul: item.judul,
  isi: item.isi,
  tanggalTerbit: item.tanggal_terbit ?? null,
  penulis: item.penulis ?? "",
  status: item.status === "dipublikasi" ? "Dipublikasi" : "Draft",
  foto: item.foto ?? "",
  hasFoto: item.has_foto,
  createdAt: item.created_at,
});

const mapStatus = (status?: string) =>
  status === "Dipublikasi" ? "dipublikasi" : "draft";

export const adminBeritaApi = {
  getAllBerita: async (): Promise<BeritaAdminView[]> => {
    const list = await http.getOr("/v1/berita/admin", BeritaListSchema, []);
    return list.map(normalizeBeritaAdmin);
  },

  getBeritaByStatus: async (status: string): Promise<BeritaAdminView[]> => {
    const list = await http.getOr(
      `/v1/berita/status/${mapStatus(status)}`,
      BeritaListSchema,
      [],
    );
    return list.map(normalizeBeritaAdmin);
  },

  getBeritaById: async (
    id: number | string,
  ): Promise<BeritaAdminView | null> => {
    try {
      const item = await http.get(`/v1/berita/admin/${id}`, BeritaSchema);
      return normalizeBeritaAdmin(item);
    } catch {
      return null;
    }
  },

  addBerita: (data: {
    judul: string;
    isi: string;
    tanggalTerbit?: string;
    penulis?: string;
    status?: string;
    foto?: File | null;
  }) =>
    http.postForm("/v1/berita/", beritaForm(data), AnyDataSchema),

  updateBerita: (
    id: number | string,
    data: Parameters<typeof beritaForm>[0] & { deleteFoto?: boolean },
  ) => {
    const form = beritaForm(data);
    if (data.deleteFoto) form.append("deleteFoto", "true");
    return http.putForm(`/v1/berita/${id}`, form, AnyDataSchema);
  },

  toggleStatus: (id: number | string) =>
    http.put(`/v1/berita/${id}/toggle-status`, null, AnyDataSchema),

  deleteBerita: (id: number | string) =>
    http.delete(`/v1/berita/${id}`, AnyDataSchema),
};

const beritaForm = (data: {
  judul: string;
  isi: string;
  tanggalTerbit?: string;
  penulis?: string;
  status?: string;
  foto?: File | null;
}): FormData => {
  const form = new FormData();
  form.append("judul", data.judul);
  form.append("isi", data.isi);
  form.append("tanggalTerbit", data.tanggalTerbit ?? "");
  form.append("penulis", data.penulis ?? "Admin");
  form.append("status", mapStatus(data.status || "Draft"));
  if (data.foto) form.append("foto", data.foto);
  return form;
};
