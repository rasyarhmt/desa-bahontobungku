import { useState } from "react";
import {
  FaBullhorn,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
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
        return "bg-green-100 text-green-800";
      case "Kadaluarsa":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaBullhorn className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pengumuman
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Pengumuman
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaBullhorn className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {pengumumanData.length}
            </div>
            <p className="text-sm text-gray-600">Pengumuman tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pengumuman Aktif
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaCheck className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countAktif}
            </div>
            <p className="text-sm text-gray-600">Pengumuman aktif</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Pengumuman Kadaluarsa
              </h3>
              <div className="bg-gray-100 p-2 rounded-lg">
                <FaClock className="text-gray-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countKadaluarsa}
            </div>
            <p className="text-sm text-gray-600">Pengumuman kadaluarsa</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "semua"
                  ? "bg-purple-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaBullhorn
                className={
                  activeTab === "semua" ? "text-white" : "text-purple-500"
                }
              />
              <span>Semua Pengumuman</span>
            </button>
            <button
              onClick={() => setActiveTab("aktif")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "aktif"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaCheck
                className={
                  activeTab === "aktif" ? "text-white" : "text-green-500"
                }
              />
              <span>Aktif</span>
            </button>
            <button
              onClick={() => setActiveTab("kadaluarsa")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "kadaluarsa"
                  ? "bg-gray-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaClock
                className={
                  activeTab === "kadaluarsa" ? "text-white" : "text-gray-500"
                }
              />
              <span>Kadaluarsa</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar Pengumuman
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola pengumuman dan informasi penting
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-64"
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <FaPlus className="text-white" />
                <span>Tambah Pengumuman</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-4xl text-purple-500 mx-auto mb-4" />
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchAllPengumuman}
                className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Judul
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Tanggal Mulai
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Tanggal Selesai
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((pengumuman) => (
                      <tr key={pengumuman.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {pengumuman.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {pengumuman.judul}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            {formatDateShort(pengumuman.tanggalMulai)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            {formatDateShort(pengumuman.tanggalSelesai)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              pengumuman.status,
                            )}`}
                          >
                            {pengumuman.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handlePreview(pengumuman.id)}
                              className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                              title="Lihat Detail"
                            >
                              <FaEye className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(pengumuman.id)}
                              className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(pengumuman.id)}
                              className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                              title="Hapus"
                            >
                              <FaTrash className="text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
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
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Tambah Pengumuman Baru
              </h3>
              <p className="text-gray-600 text-sm">
                Masukkan informasi pengumuman yang akan ditambahkan
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="judul"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Masukkan judul pengumuman"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tanggal_mulai"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tanggal_selesai"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="isi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Isi Pengumuman
                </label>
                <textarea
                  id="isi"
                  value={formData.isi}
                  onChange={(e) =>
                    setFormData({ ...formData, isi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                  placeholder="Isi pengumuman lengkap"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={addModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Edit Pengumuman
              </h3>
              <p className="text-gray-600 text-sm">Ubah informasi pengumuman</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="edit-judul"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-tanggalMulai"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-tanggalSelesai"
                    className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-isi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Isi Pengumuman
                </label>
                <textarea
                  id="edit-isi"
                  value={formData.isi}
                  onChange={(e) =>
                    setFormData({ ...formData, isi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[150px]"
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={editModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus pengumuman "
                {currentItem?.judul}"? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={deleteModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                <FaBullhorn className="inline-block mr-2 text-purple-500" />
                Detail Pengumuman
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {previewItem?.judul}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tanggal Mulai</p>
                    <p className="font-medium flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      {previewItem?.tanggal && formatDateLong(previewItem.tanggal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Berakhir</p>
                    <p className="font-medium flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      {previewItem?.tanggalBerakhir &&
                        formatDateLong(previewItem.tanggalBerakhir)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  Isi Pengumuman
                </h4>
                <div className="text-gray-700 whitespace-pre-line">
                  {previewItem?.isi}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
              {previewItem?.status === "Kadaluarsa" && (
                <button
                  onClick={() => handleReactivate(previewItem.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FaCheck className="text-white" />
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
