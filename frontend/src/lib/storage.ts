import { type Berita } from "@/lib/api/schemas";

const SELECTED_BERITA_KEY = "selectedBerita";

/** Baca berita yang dioper lintas-halaman dari daftar ke halaman detail. */
export const getSelectedBerita = (): Berita | null => {
  const raw = localStorage.getItem(SELECTED_BERITA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Berita;
  } catch {
    return null;
  }
};

/** Simpan berita yang dipilih sebelum navigasi ke halaman detail. */
export const setSelectedBerita = (berita: Berita): void => {
  localStorage.setItem(SELECTED_BERITA_KEY, JSON.stringify(berita));
};
