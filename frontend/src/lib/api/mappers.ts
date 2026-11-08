import { resolveUploadUrl } from "./config";
import type { Aparatur, Media, Pengumuman } from "./schemas";

/** Ekstrak timestamp dari nama file (angka di awal) bila `created_at` kosong. */
export const inferCreatedAt = (item: Media): string => {
  if (item.created_at) return item.created_at;
  if (item.file) {
    const possibleTimestamp = Number.parseInt(item.file.split(".")[0], 10);
    if (!Number.isNaN(possibleTimestamp)) {
      return new Date(possibleTimestamp).toISOString();
    }
  }
  return new Date().toISOString();
};

/** URL absolut berkas upload media. */
export const getMediaUrl = (filename?: string | null): string =>
  resolveUploadUrl(filename ?? "");

const MEDIA_THUMBNAIL_PLACEHOLDER = "/placeholder.svg?height=300&width=400";

/** URL thumbnail media (fallback placeholder). */
export const getVideoThumbnail = (item: Media): string => {
  if (!item.file) return MEDIA_THUMBNAIL_PLACEHOLDER;
  return (
    resolveUploadUrl(item.thumbnail || item.file) || MEDIA_THUMBNAIL_PLACEHOLDER
  );
};

/** Normalkan field snake_case pengumuman menjadi camelCase. */
export const normalizePengumuman = (item: Pengumuman) => ({
  id: item.id,
  judul: item.judul,
  isi: item.isi,
  tanggalMulai: item.tanggal_mulai,
  tanggalSelesai: item.tanggal_selesai,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

export interface AparatFormatted {
  id: number;
  nama: string;
  jabatan: string;
  nip: string;
  foto: string;
  telepon?: string;
}

/** Format aparatur ke bentuk siap-render (foto absolut, nip fallback ke nik). */
export const formatAparatData = (data: Aparatur[]): AparatFormatted[] =>
  data.map((item) => ({
    id: item.id,
    nama: item.nama,
    jabatan: item.jabatan ?? "",
    nip: item.nip || item.nik || "",
    foto: resolveUploadUrl(item.foto),
    telepon: item.telepon ?? undefined,
  }));
