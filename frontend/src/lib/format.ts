import { z } from "zod/v3";

import { resolveUploadUrl } from "./api/config";

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Format tanggal ke "17 Agustus 1945" (id-ID); fallback return string asal. */
export const formatDateLong = (dateString?: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/** Format tanggal ringkas "17 Agu 1945" (id-ID); fallback return string asal. */
export const formatDateShort = (
  dateString?: string | null,
  fallback = "-",
): string => {
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Format tanggal + jam, mis. "12 Okt 2026, 14.30" (id-ID). */
export const formatDateTime = (
  dateString?: string | null,
  options: { month?: "short" | "long"; fallback?: string } = {},
): string => {
  const { month = "short", fallback = "-" } = options;
  if (!dateString) return fallback;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month,
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Konversi tanggal ke nilai `<input type="date">` (YYYY-MM-DD); "" bila invalid. */
export const toDateInputValue = (value?: string | Date | null): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Format angka ke IDR tanpa desimal. */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

/** 1 -> "Januari" */
export const getMonthName = (monthNumber: number | string): string => {
  const n = z.coerce.number().parse(monthNumber);
  return MONTHS_ID[n - 1] || "";
};

/** Bangun URL gambar upload; kembalikan fallback bila path kosong. */
export const formatImageUrl = (
  path?: string | null,
  fallback = "/placeholder.svg",
): string => resolveUploadUrl(path) || fallback;

/** Resolve path upload (berita/media/aparatur) ke URL absolut. */
export { resolveUploadUrl };