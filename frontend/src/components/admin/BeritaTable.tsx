import {
  CalendarDays,
  Check,
  CircleX,
  Eye,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";

import { formatDateLong, formatImageUrl } from "@/lib/format";

import { getStatusColor, type BeritaItem } from "./beritaShared";

interface BeritaTableProps {
  items: BeritaItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export default function BeritaTable({
  items,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onRetry,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
  onToggleStatus,
}: BeritaTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Berita</h2>
          <p className="text-base text-slate-600">
            Kelola berita dan artikel website desa
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="search-berita"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Cari Berita
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              />
              <input
                id="search-berita"
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="min-h-11 w-64 rounded-xl border border-slate-300 py-2 pl-10 pr-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/30"
              />
            </div>
          </div>
          <button
            onClick={onAdd}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
          >
            <Plus aria-hidden="true" className="size-5" />
            <span>Tambah Berita</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 size-10 animate-spin text-[#0b6393]"
          />
          <p className="text-base text-slate-600">Memuat data berita...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-base text-red-700">
          <p>{error}</p>
          <button
            onClick={onRetry}
            className="mt-4 min-h-11 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-slate-50">
                <th className="rounded-tl-lg px-4 py-4 text-left text-base font-bold text-slate-900">
                  Judul
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Thumbnail
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Tanggal
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Penulis
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Status
                </th>
                <th className="rounded-tr-lg px-4 py-4 text-right text-base font-bold text-slate-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length > 0 ? (
                items.map((berita) => (
                  <tr key={berita.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {berita.judul}
                    </td>
                    <td className="px-4 py-4">
                      {berita.foto ? (
                        <img
                          src={formatImageUrl(berita.foto)}
                          alt={berita.judul}
                          className="h-12 w-12 rounded-lg bg-slate-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                          <ImageIcon
                            aria-hidden="true"
                            className="size-5 text-slate-400"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          aria-hidden="true"
                          className="size-5 text-slate-400"
                        />
                        {formatDateLong(berita.tanggalTerbit)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      <div className="flex items-center gap-2">
                        <UserRound
                          aria-hidden="true"
                          className="size-5 text-slate-400"
                        />
                        {berita.penulis}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1.5 text-base font-semibold ${getStatusColor(
                            berita.status,
                          )}`}
                        >
                          {berita.status || "Dipublikasi"}
                        </span>
                        <button
                          onClick={() => onToggleStatus(berita.id)}
                          aria-label={
                            berita.status === "Dipublikasi"
                              ? "Ubah ke Draft"
                              : "Publikasikan"
                          }
                          title={
                            berita.status === "Dipublikasi"
                              ? "Ubah ke Draft"
                              : "Publikasikan"
                          }
                          className={`flex min-h-11 min-w-11 items-center justify-center rounded-xl ${
                            berita.status === "Dipublikasi"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {berita.status === "Dipublikasi" ? (
                            <CircleX aria-hidden="true" className="size-5" />
                          ) : (
                            <Check aria-hidden="true" className="size-5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreview(berita.id)}
                          aria-label="Lihat Detail"
                          title="Lihat Detail"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393] transition-colors hover:bg-sky-100"
                        >
                          <Eye aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          onClick={() => onEdit(berita.id)}
                          aria-label="Edit"
                          title="Edit"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          onClick={() => onDelete(berita.id)}
                          aria-label="Hapus"
                          title="Hapus"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Trash2 aria-hidden="true" className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-base text-slate-600"
                  >
                    Tidak ada data berita yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
