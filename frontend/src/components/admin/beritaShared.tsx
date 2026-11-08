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

export const getStatusColor = (status: string | undefined) => {
  switch (status) {
    case "Dipublikasi":
      return "bg-green-100 text-green-800";
    case "Draft":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
