import {
  BellRing,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  IdCard,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { formatDateLong, formatImageUrl } from "@/lib/format";
import type { AparaturFormatted } from "@/lib/api/aparatur";
import type { PendudukSummary } from "@/lib/api/penduduk";
import type { Berita, Pelayanan } from "@/lib/api/schemas";

export interface HeroMetric {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}

export interface NewsItem {
  to: string;
  category: string;
  date: string;
  author: string;
  title: string;
  excerpt: string;
  image: string;
  categoryClass: string;
}

export interface ApparatusItem {
  name: string;
  role: string;
  description?: string;
  tag?: string;
  image?: string;
  initials: string;
  avatarClass: string;
}

export interface SelfServiceItem {
  to: string;
  title: string;
  description: string;
  processing: string;
  processingIcon: LucideIcon;
  icon: LucideIcon;
  iconClass: string;
}

export interface HomeContact {
  phone: string;
  phoneLabel: string;
  whatsappUrl: string;
}

export interface InfoModule {
  to: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  iconClass: string;
}

export const INFO_MODULES: InfoModule[] = [
  {
    to: "/Information",
    title: "Berita",
    description:
      "Baca berbagai berita terbaru tentang kegiatan, kemajuan, dan agenda pembangunan desa Bahontobungku.",
    action: "Buka Berita",
    icon: BookOpen,
    iconClass:
      "bg-surface-container-high text-primary group-hover:bg-primary-container group-hover:text-on-primary-container",
  },
  {
    to: "/Information",
    title: "Pengumuman",
    description:
      "Informasi resmi terkait surat edaran, bantuan sosial, dan pengumuman mendesak untuk warga masyarakat desa.",
    action: "Lihat Pengumuman",
    icon: BellRing,
    iconClass:
      "bg-secondary-container text-on-secondary-container group-hover:bg-primary group-hover:text-on-primary",
  },
  {
    to: "/ProfilDesa",
    title: "Aparatur",
    description:
      "Ketahui profil singkat, struktur organisasi, dan kontak para perangkat pemerintahan desa Bahontobungku.",
    action: "Struktur Aparatur",
    icon: UsersRound,
    iconClass:
      "bg-surface-container-high text-on-surface-variant group-hover:bg-primary-container group-hover:text-on-primary-container",
  },
  {
    to: "/Infografis",
    title: "Fasilitas",
    description:
      "Lihat data statistik, peta lokasi, dan kelengkapan fasilitas publik yang ada di desa Bahontobungku.",
    action: "Inventaris Fasilitas",
    icon: ClipboardCheck,
    iconClass:
      "bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary",
  },
];

const numberFormat = new Intl.NumberFormat("id-ID");

const SERVICE_ICONS: LucideIcon[] = [FileText, IdCard, BriefcaseBusiness];

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "PD";

export const toHeroMetrics = (
  summary: PendudukSummary,
  serviceCount: number,
  apparatusCount: number,
): HeroMetric[] => [
  {
    label: "Total Penduduk",
    value: numberFormat.format(summary.totalPenduduk),
    unit: "Jiwa",
    highlight: true,
  },
  {
    label: "Kepala Keluarga",
    value: numberFormat.format(summary.totalKepalaKeluarga),
    unit: "KK",
  },
  {
    label: "Aparatur Desa",
    value: numberFormat.format(apparatusCount),
    unit: "Orang",
  },
  {
    label: "Layanan Aktif",
    value: numberFormat.format(serviceCount),
    unit: "Jenis",
  },
];

export const toNewsItems = (berita: Berita[]): NewsItem[] =>
  berita.map((item, index) => ({
    to: `/berita-detail/${item.id}`,
    category: "Berita Desa",
    date: formatDateLong(item.tanggal_terbit),
    author: item.penulis || "Humas Desa",
    title: item.judul,
    excerpt: stripHtml(item.isi).slice(0, 150),
    image: formatImageUrl(item.foto, "/placeholder.svg"),
    categoryClass:
      index % 3 === 0
        ? "bg-primary text-on-primary"
        : index % 3 === 1
          ? "bg-tertiary-container text-on-tertiary-container"
          : "bg-primary-fixed-dim text-on-primary-fixed",
  }));

export const toApparatusItems = (
  aparatur: AparaturFormatted[],
): ApparatusItem[] =>
  aparatur.map((item, index) => ({
    name: item.nama,
    role: item.jabatan || "Perangkat Desa",
    description: item.nip
      ? `NIP/NIK: ${item.nip}`
      : item.telepon
        ? `Kontak: ${item.telepon}`
        : undefined,
    tag: item.status || "Aparatur Desa",
    image: item.foto || undefined,
    initials: initialsOf(item.nama),
    avatarClass:
      index % 4 === 0
        ? "bg-primary-container text-on-primary-container"
        : index % 4 === 1
          ? "bg-secondary-container text-on-secondary-container"
          : index % 4 === 2
            ? "bg-surface-container-high text-on-surface-variant"
            : "bg-surface-container text-primary",
  }));

export const toSelfServices = (layanan: Pelayanan[]): SelfServiceItem[] =>
  layanan
    .filter((item) => item.status === "aktif")
    .slice(0, 3)
    .map((item, index) => ({
      to: `/pelayanan/surat/${item.id}`,
      title: item.nama_layanan,
      description: item.deskripsi,
      processing: "Tersedia Online",
      processingIcon: CheckCircle2,
      icon: SERVICE_ICONS[index % SERVICE_ICONS.length],
      iconClass:
        index % 3 === 0
          ? "bg-primary-container text-on-primary-container"
          : index % 3 === 1
            ? "bg-secondary-container text-on-secondary-container"
            : "bg-surface-container text-primary",
    }));

export const toHomeContact = (
  aparatur: AparaturFormatted[],
): HomeContact | undefined => {
  const telepon = aparatur.find((item) => item.telepon)?.telepon;
  if (!telepon) return undefined;
  const digits = telepon.replace(/\D/g, "");
  if (!digits) return undefined;
  const international = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;
  return {
    phone: digits,
    phoneLabel: telepon,
    whatsappUrl: `https://wa.me/${international}`,
  };
};
