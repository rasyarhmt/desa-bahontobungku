import type { Berita } from "@/lib/api/schemas";

export type BeritaSort = "terbaru" | "terlama";

export const BERITA_PAGE_SIZE = 9;

export const beritaDetailPath = (id: number): string => `/berita-detail/${id}`;

export const getBeritaExcerpt = (text: string, length = 120): string => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length).trimEnd()}…`;
};

const getBeritaTime = (item: Berita): number => {
  const value = new Date(item.tanggal_terbit ?? item.created_at ?? "").getTime();
  return Number.isNaN(value) ? 0 : value;
};

export const sortBerita = (items: Berita[], sort: BeritaSort): Berita[] =>
  [...items].sort((a, b) =>
    sort === "terbaru"
      ? getBeritaTime(b) - getBeritaTime(a)
      : getBeritaTime(a) - getBeritaTime(b),
  );

export const filterBerita = (items: Berita[], query: string): Berita[] => {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items.filter(
    (item) =>
      item.judul.toLowerCase().includes(q) ||
      item.isi.toLowerCase().includes(q) ||
      (item.penulis ?? "").toLowerCase().includes(q),
  );
};

export const countBeritaPenulis = (items: Berita[]): number =>
  new Set(
    items
      .map((item) => item.penulis?.trim())
      .filter((penulis): penulis is string => Boolean(penulis)),
  ).size;
