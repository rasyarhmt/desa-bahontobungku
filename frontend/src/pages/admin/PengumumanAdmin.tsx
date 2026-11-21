import { useState } from "react";
import {
  CalendarDays,
  Check,
  Clock,
  Eye,
  LoaderCircle,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { adminPengumumanApi } from "@/lib/api/admin";
import { getAuthState } from "@/lib/auth";
import { formatDateLong, formatDateShort, toDateInputValue } from "@/lib/format";
import { useAsyncData, useCrudResource, useSearchFilter } from "@/hooks";

interface PengumumanItem {
  id: number;
  judul: string;
  isi: string;
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  status: string;
  tanggal?: string;
  tanggalBerakhir?: string;
}

interface PengumumanForm {
  judul: string;
  isi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
}

const PengumumanAdmin = () => {
  const { token } = getAuthState();

  const [activeTab, setActiveTab] = useState("semua");

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<PengumumanItem | null>(null);

  const {
    data: pengumumanData,
    isLoading,
    error,
    refetch: fetchAllPengumuman,
  } = useAsyncData<PengumumanItem[]>(
    async () => {
      const data = await adminPengumumanApi.getAllPengumuman();
      return data.map((item) => ({
        id: item.id,
        judul: item.judul,
        isi: item.isi,
        tanggalMulai: item.tanggalMulai
          ? new Date(item.tanggalMulai).toISOString()
          : null,
        tanggalSelesai: item.tanggalSelesai
          ? new Date(item.tanggalSelesai).toISOString()
          : null,
        status:
          new Date(item.tanggalSelesai) < new Date() ? "Kadaluarsa" : "Aktif",
      }));
    },
    [],
    { errorMessage: "Gagal memuat data pengumuman." },
  );

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filtered: filteredData,
  } = useSearchFilter(pengumumanData, (item, query) => {
    const q = query.toLowerCase();
    const matchesSearch =
      item.judul.toLowerCase().includes(q) ||
      item.isi.toLowerCase().includes(q);

    const matchesFilter =
      activeTab === "semua" ||
      (activeTab === "aktif" && item.status === "Aktif") ||
      (activeTab === "kadaluarsa" && item.status === "Kadaluarsa");

    return matchesSearch && matchesFilter;
  });

  const countAktif = pengumumanData.filter(
    (item) => item.status === "Aktif",
  ).length;
  const countKadaluarsa = pengumumanData.filter(
    (item) => item.status === "Kadaluarsa",
  ).length;

  const {
    addModal,
    editModal,
    deleteModal,
    currentItem,
    formData,
    setFormData,
    handleAdd,
    handleEdit,
    handleDelete,
    saveNewItem,
    saveEditedItem,
    confirmDelete,
    runAction,
  } = useCrudResource<PengumumanItem, PengumumanForm>({
    items: pengumumanData,
    initialForm: {
      judul: "",
      isi: "",
      tanggalMulai: toDateInputValue(new Date()),
      tanggalSelesai: toDateInputValue(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ),
      status: "Aktif",
    },
    toForm: (item) => ({
      judul: item.judul,
      isi: item.isi,
      tanggalMulai: item.tanggalMulai
        ? toDateInputValue(item.tanggalMulai)
        : "",
      tanggalSelesai: item.tanggalSelesai
        ? toDateInputValue(item.tanggalSelesai)
        : "",
      status: item.status,
    }),
    validate: (form, mode) =>
      mode === "add" &&
      (!form.judul || !form.isi || !form.tanggalMulai || !form.tanggalSelesai)
        ? "Semua data wajib diisi!"
        : null,
    guard: () =>
      token ? null : "Anda harus login sebagai admin untuk mengelola pengumuman",
    create: (form) => adminPengumumanApi.addPengumuman(form),
    update: (form, item) => adminPengumumanApi.updatePengumuman(item.id, form),
    remove: (item) => adminPengumumanApi.deletePengumuman(item.id),
    refetch: fetchAllPengumuman,
    messages: {
      created: "Pengumuman berhasil ditambahkan",
      updated: "Pengumuman berhasil diperbarui",
      deleted: "Pengumuman berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan pengumuman.",
      deleteError: "Terjadi kesalahan saat menghapus pengumuman.",
    },
  });

  const handlePreview = (id: number) => {
    const item = pengumumanData.find((item) => item.id === id);
    if (item) {
      setPreviewItem(item);
      setShowPreviewModal(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-emerald-50 text-emerald-700";
      case "Kadaluarsa":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleReactivate = async (id: number) => {
    const ok = await runAction(
      () => {
        const item = pengumumanData.find((item) => item.id === id);
        if (!item) return Promise.resolve();

        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 7);

        return adminPengumumanApi.updatePengumuman(id, {
          judul: item.judul,
          isi: item.isi,
          tanggalMulai: toDateInputValue(new Date()),
          tanggalSelesai: toDateInputValue(newEndDate),
        });
      },
      "Pengumuman berhasil diaktifkan kembali",
      "Terjadi kesalahan saat mengaktifkan kembali pengumuman.",
    );

    if (ok) setShowPreviewModal(false);
  };

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
            <Megaphone className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Pengumuman
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Pengumuman
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
                <Megaphone className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {pengumumanData.length}
            </div>
            <p className="text-sm text-slate-600">Pengumuman tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Pengumuman Aktif
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Check className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countAktif}
            </div>
            <p className="text-sm text-slate-600">Pengumuman aktif</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Pengumuman Kadaluarsa
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Clock className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countKadaluarsa}
            </div>
            <p className="text-sm text-slate-600">Pengumuman kadaluarsa</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              aria-pressed={activeTab === "semua"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "semua"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Megaphone className="size-5" aria-hidden="true" />
              <span>Semua Pengumuman</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("aktif")}
              aria-pressed={activeTab === "aktif"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "aktif"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Check className="size-5" aria-hidden="true" />
              <span>Aktif</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kadaluarsa")}
              aria-pressed={activeTab === "kadaluarsa"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "kadaluarsa"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Clock className="size-5" aria-hidden="true" />
              <span>Kadaluarsa</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Daftar Pengumuman
              </h2>
              <p className="text-base text-slate-600">
                Kelola pengumuman dan informasi penting
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  htmlFor="cari-pengumuman"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Cari pengumuman
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="cari-pengumuman"
                    type="text"
                    placeholder="Cari pengumuman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="min-h-11 w-64 rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#0a547e]"
              >
                <Plus className="size-5" aria-hidden="true" />
                <span>Tambah Pengumuman</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <LoaderCircle
                className="mx-auto mb-4 block size-5 animate-spin text-[#0b6393]"
                aria-hidden="true"
              />
              <p className="text-base text-slate-600">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-700">
              <p className="text-base">{error}</p>
              <button
                type="button"
                onClick={fetchAllPengumuman}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#0a547e]"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="rounded-tl-lg px-4 py-4 text-left text-base font-bold text-slate-900">
                      ID
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Judul
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Tanggal Mulai
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Tanggal Selesai
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
                  {filteredData.length > 0 ? (
                    filteredData.map((pengumuman) => (
                      <tr key={pengumuman.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-base text-slate-800">
                          {pengumuman.id}
                        </td>
                        <td className="px-4 py-4 text-base font-semibold text-slate-900">
                          {pengumuman.judul}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              className="size-5 shrink-0 text-slate-500"
                              aria-hidden="true"
                            />
                            {formatDateShort(pengumuman.tanggalMulai)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              className="size-5 shrink-0 text-slate-500"
                              aria-hidden="true"
                            />
                            {formatDateShort(pengumuman.tanggalSelesai)}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-base">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                              pengumuman.status,
                            )}`}
                          >
                            {pengumuman.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreview(pengumuman.id)}
                              aria-label={`Lihat detail ${pengumuman.judul}`}
                              title="Lihat Detail"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393] transition-colors hover:bg-[#d3e6f0]"
                            >
                              <Eye className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(pengumuman.id)}
                              aria-label={`Edit ${pengumuman.judul}`}
                              title="Edit"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                            >
                              <Pencil className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(pengumuman.id)}
                              aria-label={`Hapus ${pengumuman.judul}`}
                              title="Hapus"
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 transition-colors hover:bg-red-100"
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
                        colSpan={7}
                        className="px-4 py-8 text-center text-base text-slate-600"
                      >
                        Tidak ada data pengumuman yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Tambah Pengumuman Baru
              </h3>
              <p className="text-base text-slate-600">
                Masukkan informasi pengumuman yang akan ditambahkan
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="judul"
                  className="mb-2 block text-base font-semibold text-slate-900"
                >
                  Judul Pengumuman
                </label>
                <input
                  id="judul"
                  type="text"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Masukkan judul pengumuman"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="tanggal_mulai"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    Tanggal Mulai
                  </label>
                  <input
                    id="tanggal_mulai"
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalMulai: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tanggal_selesai"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    Tanggal Berakhir
                  </label>
                  <input
                    id="tanggal_selesai"
                    type="date"
                    value={formData.tanggalSelesai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalSelesai: e.target.value,
                      })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="isi"
                  className="mb-2 block text-base font-semibold text-slate-900"
                >
                  Isi Pengumuman
                </label>
                <textarea
                  id="isi"
                  value={formData.isi}
                  onChange={(e) =>
                    setFormData({ ...formData, isi: e.target.value })
                  }
                  className="min-h-[150px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Isi pengumuman lengkap"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={addModal.close}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveNewItem}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#0a547e]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Edit Pengumuman
              </h3>
              <p className="text-base text-slate-600">
                Ubah informasi pengumuman
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-judul"
                  className="mb-2 block text-base font-semibold text-slate-900"
                >
                  Judul Pengumuman
                </label>
                <input
                  id="edit-judul"
                  type="text"
                  value={formData.judul}
                  onChange={(e) =>
                    setFormData({ ...formData, judul: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-tanggalMulai"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    Tanggal Mulai
                  </label>
                  <input
                    id="edit-tanggalMulai"
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggalMulai: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-tanggalSelesai"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    Tanggal Berakhir
                  </label>
                  <input
                    id="edit-tanggalSelesai"
                    type="date"
                    value={formData.tanggalSelesai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggalSelesai: e.target.value,
                      })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-isi"
                  className="mb-2 block text-base font-semibold text-slate-900"
                >
                  Isi Pengumuman
                </label>
                <textarea
                  id="edit-isi"
                  value={formData.isi}
                  onChange={(e) =>
                    setFormData({ ...formData, isi: e.target.value })
                  }
                  className="min-h-[150px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={editModal.close}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveEditedItem}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#0a547e]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus pengumuman "
                {currentItem?.judul}"? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={deleteModal.close}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 text-base font-semibold text-white transition-colors hover:bg-red-800"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <Megaphone
                  className="size-5 text-[#0b6393]"
                  aria-hidden="true"
                />
                Detail Pengumuman
              </h3>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Tutup detail pengumuman"
                title="Tutup"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-6">
              <div className="mb-4 rounded-xl border border-slate-200 bg-[#f6f8fb] p-4">
                <h2 className="mb-2 text-2xl font-bold text-slate-900">
                  {previewItem?.judul}
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-base text-slate-600">Tanggal Mulai</p>
                    <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <CalendarDays
                        className="size-5 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      {previewItem?.tanggal && formatDateLong(previewItem.tanggal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-base text-slate-600">Tanggal Berakhir</p>
                    <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
                      <CalendarDays
                        className="size-5 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      {previewItem?.tanggalBerakhir &&
                        formatDateLong(previewItem.tanggalBerakhir)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="mb-2 text-lg font-semibold text-slate-900">
                  Isi Pengumuman
                </h4>
                <div className="whitespace-pre-line text-base text-slate-700">
                  {previewItem?.isi}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Tutup
              </button>
              {previewItem?.status === "Kadaluarsa" && (
                <button
                  type="button"
                  onClick={() => handleReactivate(previewItem.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white transition-colors hover:bg-emerald-800"
                >
                  <Check className="size-5" aria-hidden="true" />
                  <span>Aktifkan Kembali</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengumumanAdmin;
