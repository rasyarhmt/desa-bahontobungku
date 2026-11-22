import { FileText, Images, LayoutGrid, Video, type LucideIcon } from "lucide-react";

export type MediaFilterValue = "all" | "foto" | "video" | "dokumen";

export const MEDIA_FILTERS: Array<{
  value: MediaFilterValue;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "all", label: "Semua Media", icon: LayoutGrid },
  { value: "foto", label: "Galeri Foto", icon: Images },
  { value: "video", label: "Liputan Video", icon: Video },
  { value: "dokumen", label: "Dokumen / Buletin", icon: FileText },
];

export const mediaTypeLabel = (tipe: string): string => {
  const normalized = tipe.toLowerCase();
  if (normalized === "foto") return "Galeri Foto";
  if (normalized === "video") return "Liputan Video";
  if (normalized === "dokumen") return "Dokumen";
  return tipe || "Media";
};

export const mediaTypeIcon = (tipe: string): LucideIcon => {
  const normalized = tipe.toLowerCase();
  if (normalized === "foto") return Images;
  if (normalized === "video") return Video;
  if (normalized === "dokumen") return FileText;
  return LayoutGrid;
};

export const mediaDetailPath = (id: number): string => `/media/${id}`;
