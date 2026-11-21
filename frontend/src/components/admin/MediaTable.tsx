import { Eye, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";

import { getMediaIcon, type MediaItem } from "./mediaShared";

interface MediaTableProps {
  items: MediaItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function MediaTable({
  items,
  isLoading,
  error,
  onRetry,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
}: MediaTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Daftar Media</h2>
          <p className="text-base text-slate-600">
            Kelola media yang tersedia di website desa
          </p>
        </div>
        <button
          onClick={onAdd}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
        >
          <Plus aria-hidden="true" className="size-5" />
          <span>Tambah Media</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <LoaderCircle
            aria-hidden="true"
            className="mx-auto mb-4 size-10 animate-spin text-[#0b6393]"
          />
          <p className="text-base text-slate-600">Memuat data media...</p>
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
                  ID
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Nama
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Tipe
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Deskripsi
                </th>
                <th className="rounded-tr-lg px-4 py-4 text-right text-base font-bold text-slate-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-800">{item.id}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      <span>{item.nama}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      <div className="flex items-center gap-2">
                        {getMediaIcon(item.tipe ?? "")}
                        {(item.tipe ?? "").charAt(0).toUpperCase() +
                          (item.tipe ?? "").slice(1)}
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-4 text-slate-800">
                      {item.deskripsi}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onPreview(item.id)}
                          aria-label="Pratinjau"
                          title="Pratinjau"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393] transition-colors hover:bg-sky-100"
                        >
                          <Eye aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          onClick={() => onEdit(item.id)}
                          aria-label="Edit"
                          title="Edit"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                        >
                          <Pencil aria-hidden="true" className="size-5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
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
                    colSpan={5}
                    className="px-4 py-8 text-center text-base text-slate-600"
                  >
                    Tidak ada data media yang ditemukan.
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
