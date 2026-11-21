import {
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";

import { type SuratItem } from "@/lib/api/admin";
import { formatDateShort } from "@/lib/format";

import { getSuratIcon } from "./suratShared";

interface SuratTableProps {
  items: SuratItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRetry: () => void;
  onAdd: () => void;
  onPreview: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function SuratTable({
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
}: SuratTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Daftar Arsip Surat
          </h2>
          <p className="mt-1 text-base text-slate-600">
            Kelola arsip surat masuk dan keluar di sistem
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="cari-surat"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Cari surat
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="cari-surat"
                type="text"
                placeholder="Nomor atau perihal"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20 sm:w-72"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
          >
            <Plus className="size-5" aria-hidden="true" />
            Tambah Surat
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <LoaderCircle
            className="size-5 animate-spin text-[#0b6393]"
            aria-hidden="true"
          />
          <p className="mt-3 text-base text-slate-600">Memuat data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-base font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  No. Surat
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Jenis
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Perihal
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Pengirim/Penerima
                </th>
                <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                  Tanggal
                </th>
                <th className="px-4 py-4 text-right text-base font-bold text-slate-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.length > 0 ? (
                items.map((surat, index) => (
                  <tr key={surat.id || index} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {surat.nomor}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      <div className="flex items-center gap-2">
                        {getSuratIcon(surat.jenis)}
                        <span>{surat.jenis}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {surat.perihal}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {surat.pengirim}
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      {formatDateShort(surat.tanggal)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onPreview(surat.id)}
                          className="inline-flex min-h-11 min-w-11 font-semibold items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-[#0b6393] hover:bg-sky-100"
                          aria-label={`Lihat surat ${surat.nomor}`}
                          title="Lihat Detail"
                        >
                          <Eye className="size-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(surat.id)}
                          className="inline-flex min-h-11 min-w-11 font-semibold items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          aria-label={`Ubah surat ${surat.nomor}`}
                          title="Edit"
                        >
                          <Pencil className="size-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(surat.id)}
                          className="inline-flex min-h-11 min-w-11 font-semibold items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          aria-label={`Hapus surat ${surat.nomor}`}
                          title="Hapus"
                        >
                          <Trash2 className="size-5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-base text-slate-600"
                  >
                    Tidak ada data surat yang ditemukan.
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
