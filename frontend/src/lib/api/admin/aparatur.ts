import { http } from "../client";
import {
  AnyDataSchema,
  AparaturListSchema,
  AparaturSchema,
  type Aparatur,
} from "../schemas";
import { formatAparatData, type AparatFormatted } from "../mappers";

// ============================================================================
// Admin: aparatur
// ============================================================================

const AparatForm = (data: {
  nama: string;
  jabatan: string;
  nip?: string;
  telepon?: string;
  foto?: File | null;
}): FormData => {
  const form = new FormData();
  form.append("nama", data.nama);
  form.append("jabatan", data.jabatan);
  if (data.nip) form.append("nip", data.nip.trim());
  if (data.telepon) form.append("telepon", data.telepon);
  if (data.foto) form.append("foto", data.foto);
  return form;
};

export type AparatFormattedAdmin = AparatFormatted;

export const adminAparatApi = {
  getAllAparat: async (): Promise<Aparatur[]> =>
    http.getOr("/v1/aparatur/", AparaturListSchema, []),

  getAparatById: async (id: number | string): Promise<Aparatur | null> => {
    try {
      return await http.get(`/v1/aparatur/${id}`, AparaturSchema);
    } catch {
      return null;
    }
  },

  addAparat: (data: {
    nama: string;
    jabatan: string;
    nip?: string;
    telepon?: string;
    foto?: File | null;
  }) => http.postForm("/v1/aparatur/", AparatForm(data), AnyDataSchema),

  updateAparat: (id: number | string, data: Parameters<typeof AparatForm>[0]) =>
    http.putForm(`/v1/aparatur/${id}`, AparatForm(data), AnyDataSchema),

  deleteAparat: (id: number | string) =>
    http.delete(`/v1/aparatur/${id}`, AnyDataSchema),

  formatAparatData,
};
