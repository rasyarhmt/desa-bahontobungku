import { http } from "../client";
import {
  AnyDataSchema,
  PendudukMemberListSchema,
  PendudukMemberSchema,
  type PendudukMember,
} from "../schemas";

// ============================================================================
// Admin: penduduk (view camel normalisasi + mapping untuk form)
// ============================================================================

const toTitleCase = (str = ""): string =>
  str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export interface PendudukAdminView {
  id: number;
  nik: string;
  nama: string;
  alamat: string;
  tanggalLahir?: string | null;
  tempatLahir?: string | null;
  nomor_kk?: string | null;
  jenisKelamin: string;
  agama?: string | null;
  pekerjaan?: string | null;
  status: string;
  id_status_keluarga?: number | null;
  id_kepalakeluarga?: number | null;
  nama_kepalakeluarga?: string | null;
}

const normalizePendudukAdmin = (item: PendudukMember): PendudukAdminView => ({
  id: item.id,
  nik: item.nik,
  nama: item.nama,
  alamat: item.alamat ?? "",
  tanggalLahir: item.tanggal_lahir,
  tempatLahir: item.tempat_lahir,
  nomor_kk: item.nomor_kk,
  jenisKelamin: toTitleCase(item.jenis_kelamin ?? ""),
  agama: item.agama,
  pekerjaan: item.pekerjaan,
  status: toTitleCase((item.status_nama || item.status) ?? ""),
  id_status_keluarga: item.id_status_keluarga ?? null,
  id_kepalakeluarga: item.id_kepalakeluarga ?? null,
  nama_kepalakeluarga: item.nama_kepalakeluarga ?? null,
});

interface PendudukInput {
  nik: string;
  nama: string;
  alamat: string;
  tanggalLahir?: string;
  tempatLahir?: string;
  nomor_kk?: string;
  jenisKelamin?: string;
  agama?: string;
  pekerjaan?: string;
  id_status_keluarga?: number | null;
  id_kepalakeluarga?: number | null;
}

const pendudukCreatePayload = (data: PendudukInput) => ({
  nik: data.nik,
  nama: data.nama,
  alamat: data.alamat,
  tanggal_lahir: data.tanggalLahir ?? "",
  tempat_lahir: data.tempatLahir ?? "",
  nomor_kk: data.nomor_kk ?? "",
  jenis_kelamin: data.jenisKelamin ? data.jenisKelamin.toLowerCase() : "",
  agama: data.agama ?? "",
  pekerjaan: data.pekerjaan ?? "",
  id_status_keluarga: data.id_status_keluarga ?? null,
  id_kepalakeluarga: data.id_kepalakeluarga ?? null,
});

const pendudukUpdatePayload = (data: PendudukInput) => ({
  new_nik: data.nik,
  nama: data.nama,
  alamat: data.alamat,
  tanggal_lahir: data.tanggalLahir ?? "",
  tempat_lahir: data.tempatLahir ?? "",
  nomor_kk: data.nomor_kk ?? "",
  jenis_kelamin: data.jenisKelamin
    ? data.jenisKelamin.toLowerCase()
    : undefined,
  agama: data.agama ?? "",
  pekerjaan: data.pekerjaan ?? "",
  id_status_keluarga: data.id_status_keluarga ?? null,
  id_kepalakeluarga: data.id_kepalakeluarga ?? null,
});

export const adminPendudukApi = {
  getAllPenduduk: async (): Promise<PendudukAdminView[]> => {
    const list = await http.getOr("/v1/penduduk/", PendudukMemberListSchema, []);
    return list.map(normalizePendudukAdmin);
  },

  getPendudukByNik: async (nik: string): Promise<PendudukAdminView | null> => {
    try {
      const item = await http.get(
        `/v1/penduduk/nik/${nik}`,
        PendudukMemberSchema,
      );
      return normalizePendudukAdmin(item);
    } catch {
      return null;
    }
  },

  getAllKepalaKeluarga: async (): Promise<PendudukAdminView[]> => {
    const list = await http.getOr(
      "/v1/penduduk/kepala-keluarga",
      PendudukMemberListSchema,
      [],
    );
    return list.map(normalizePendudukAdmin);
  },

  addPenduduk: (data: PendudukInput) =>
    http.post(
      "/v1/penduduk/",
      pendudukCreatePayload(data),
      AnyDataSchema,
    ),

  updatePenduduk: (oldNik: string, data: PendudukInput) =>
    http.put(
      `/v1/penduduk/update/${oldNik}`,
      pendudukUpdatePayload(data),
      AnyDataSchema,
    ),

  deletePenduduk: (nik: string) =>
    http.delete(`/v1/penduduk/delete/${nik}`, AnyDataSchema),
};
