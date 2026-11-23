import type { BeritaAdminView } from "@/lib/api/admin";

export type BeritaItem = BeritaAdminView;

export interface BeritaForm {
  judul: string;
  tanggalTerbit: string;
  penulis: string;
  status: string;
  isi: string;
  foto: File | null;
  fotoPreview: string | null;
  deleteFoto: boolean;
  originalFoto: string | null;
}
