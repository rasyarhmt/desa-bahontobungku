import { http } from "../client";
import {
  AnyDataSchema,
  SuratKeluarListSchema,
  SuratMasukListSchema,
} from "../schemas";

// ============================================================================
// Admin: surat masuk/keluar (persuratan desa)
// ============================================================================

export interface SuratItem {
  id: number;
  jenis: "Surat Masuk" | "Surat Keluar";
  nomor: string;
  perihal: string;
  judul: string;
  pengirim: string;
  tanggal: string;
  file: string;
}

const toDate = (value?: string | null): string =>
  value || new Date().toISOString();

const groupOf = (jenis: string): string =>
  jenis === "Surat Masuk" ? "surat-masuk" : "surat-keluar";

const normalizeSurat = (
  item: {
    id: number;
    nomorSurat?: string | null;
    perihal?: string | null;
    pengirim?: string | null;
    penerima?: string | null;
    tanggalTerima?: string | null;
    tanggalKirim?: string | null;
    file?: string | null;
  },
  kind: "masuk" | "keluar",
): SuratItem => {
  const isMasuk = kind === "masuk";
  return {
    id: item.id,
    jenis: isMasuk ? "Surat Masuk" : "Surat Keluar",
    nomor: item.nomorSurat ?? "",
    perihal: item.perihal ?? "",
    judul: item.perihal ?? "",
    pengirim: (isMasuk ? item.pengirim : item.penerima) ?? "",
    tanggal: toDate(isMasuk ? item.tanggalTerima : item.tanggalKirim),
    file: item.file ?? "",
  };
};

export const adminSuratApi = {
  getAllSurat: async (): Promise<SuratItem[]> => {
    const [masuk, keluar] = await Promise.all([
      adminSuratApi.getSuratMasuk(),
      adminSuratApi.getSuratKeluar(),
    ]);
    return [...masuk, ...keluar];
  },

  getSuratMasuk: async (): Promise<SuratItem[]> => {
    const list = await http.getOr("/v1/surat-masuk/", SuratMasukListSchema, []);
    return list.map((item) => normalizeSurat(item, "masuk"));
  },

  getSuratKeluar: async (): Promise<SuratItem[]> => {
    const list = await http.getOr("/v1/surat-keluar/", SuratKeluarListSchema, []);
    return list.map((item) => normalizeSurat(item, "keluar"));
  },

  getSuratByYear: async (year: string): Promise<SuratItem[]> => {
    const all = await adminSuratApi.getAllSurat();
    return all.filter(
      (surat) =>
        surat.tanggal &&
        new Date(surat.tanggal).getFullYear().toString() === year,
    );
  },

  getAvailableYears: async (): Promise<string[]> => {
    const all = await adminSuratApi.getAllSurat();
    const years = Array.from(
      new Set(all.map((s) => new Date(s.tanggal).getFullYear().toString())),
    ).sort((a, b) => b.localeCompare(a));
    if (years.length > 0) return years;
    const y = new Date().getFullYear();
    return [y.toString(), (y - 1).toString(), (y - 2).toString()];
  },

  addSuratMasuk: (formData: FormData) =>
    http.postForm("/v1/surat-masuk/", formData, AnyDataSchema),

  addSuratKeluar: (formData: FormData) =>
    http.postForm("/v1/surat-keluar/", formData, AnyDataSchema),

  updateSuratMasuk: (id: number | string, formData: FormData) =>
    http.putForm(`/v1/surat-masuk/${id}`, formData, AnyDataSchema),

  updateSuratKeluar: (id: number | string, formData: FormData) =>
    http.putForm(`/v1/surat-keluar/${id}`, formData, AnyDataSchema),

  deleteSuratMasuk: (id: number | string) =>
    http.delete(`/v1/surat-masuk/${id}`, AnyDataSchema),

  deleteSuratKeluar: (id: number | string) =>
    http.delete(`/v1/surat-keluar/${id}`, AnyDataSchema),

  fetchFileBlobUrl: async (
    id: number | string,
    jenis: string,
  ): Promise<string | null> => {
    try {
      const blob = await http.getBlob(`/v1/${groupOf(jenis)}/${id}/file`);
      return URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
    } catch {
      return null;
    }
  },

  downloadFile: async (
    id: number | string,
    jenis: string,
  ): Promise<boolean> => {
    try {
      const blob = await http.getBlob(`/v1/${groupOf(jenis)}/${id}/file`);
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `surat_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      return true;
    } catch {
      return false;
    }
  },
};
