import { FileText, type LucideIcon } from "lucide-react";

import type { Pelayanan } from "@/lib/api/schemas";

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
  online: boolean;
  statusLabel: string;
  statusClass: string;
  to?: string;
}

const ICON_CLASSES = [
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-container text-on-primary-container",
  "bg-surface-container-high text-on-surface-variant",
];

export const toServiceItems = (services: Pelayanan[]): ServiceItem[] =>
  services.map((service, index) => {
    const online = service.status === "aktif" && Boolean(service.id_surat_template);
    const nonaktif = service.status === "nonaktif";

    return {
      id: service.id,
      title: service.nama_layanan,
      description: service.deskripsi || "Deskripsi layanan belum tersedia.",
      icon: FileText,
      iconClass: ICON_CLASSES[index % ICON_CLASSES.length],
      online,
      statusLabel: nonaktif
        ? "Nonaktif"
        : online
          ? "Tersedia online"
          : "Belum tersedia online",
      statusClass: nonaktif
        ? "bg-destructive/10 text-destructive"
        : online
          ? "bg-tertiary-fixed text-on-tertiary-fixed"
          : "bg-surface-container text-on-surface-variant",
      to: online ? `/pelayanan/surat/${service.id}` : undefined,
    };
  });
