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
      return "bg-emerald-50 text-emerald-700";
    case "Draft":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};
