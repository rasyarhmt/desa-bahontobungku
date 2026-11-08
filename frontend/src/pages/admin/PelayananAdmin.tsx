import { useState } from "react";
import {
  FaLink,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaBan,
  FaSpinner,
  FaFileSignature,
  FaEye,
} from "react-icons/fa";
import { type Pelayanan, type SuratTemplate } from "@/lib/api/schemas";
import { adminPelayananApi, adminTemplateApi } from "@/lib/api/admin";
import { useAsyncData, useCrudResource } from "@/hooks";
import BuatSuratModal from "@/components/admin/BuatSuratModal";
import TemplatePreviewModal from "@/components/admin/TemplatePreviewModal";

interface PelayananFormData {
  nama_layanan: string;
  deskripsi: string;
  id_surat_template: number | null;
}

const PelayananAdmin = () => {
  const [activeTab, setActiveTab] = useState("semua");
  const [selectedPelayananForSurat, setSelectedPelayananForSurat] =
    useState<Pelayanan | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SuratTemplate | null>(
    null,
  );

  const { data: templates } = useAsyncData<SuratTemplate[]>(async () => {
    const data = await adminTemplateApi.getAllTemplates();
    return Array.isArray(data) ? data : [];
  }, []);

  const getTemplateName = (id: number) => {
    if (!id) return "-";
    const tpl = templates.find((t) => Number(t.id) === Number(id));
    return tpl ? tpl.nama_template : `ID ${id}`;
  };

  const handlePreviewTemplate = (id: number) => {
    const tpl = templates.find((t) => Number(t.id) === Number(id));
    if (tpl) setPreviewTemplate(tpl);
  };

  const {
    data: layananData,
    isLoading,
    error,
    refetch: fetchPelayananData,
  } = useAsyncData<Pelayanan[]>(
    async () => {
      const data = await adminPelayananApi.getAllPelayanan();
      return Array.isArray(data) ? data : [];
    },
    [],
    {
      errorMessage: "Gagal memuat data pelayanan. Silakan coba lagi nanti.",
    },
  );

  const filteredData =
    activeTab === "semua"
      ? layananData
      : layananData.filter((item) => item.status === activeTab);

  const countAktif = layananData.filter(
    (item) => item.status === "aktif",
  ).length;
  const countNonaktif = layananData.filter(
    (item) => item.status !== "aktif",
  ).length;

  const {
    addModal,
    editModal,
    deleteModal,
    currentItem,
    formData,
    setFormData,
    isActionLoading,
    handleAdd,
    handleEdit,
    handleDelete,
    saveNewItem,
    saveEditedItem,
    confirmDelete,
    runAction,
  } = useCrudResource<Pelayanan, PelayananFormData>({
    items: layananData,
    initialForm: {
      nama_layanan: "",
      deskripsi: "",
      id_surat_template: null,
    },
    toForm: (item) => ({
      nama_layanan: item.nama_layanan,
      deskripsi: item.deskripsi,
      id_surat_template: item.id_surat_template || null,
    }),
    validate: (form) =>
      !form.nama_layanan || !form.deskripsi
        ? "Nama layanan dan deskripsi wajib diisi!"
        : null,
    create: (form) => adminPelayananApi.addPelayanan(form),
    update: (form, item) => adminPelayananApi.updatePelayanan(item.id, form),
    remove: (item) => adminPelayananApi.deletePelayanan(item.id),
    refetch: fetchPelayananData,
    messages: {
      created: "Layanan berhasil ditambahkan",
      updated: "Layanan berhasil diperbarui",
      deleted: "Layanan berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan pelayanan.",
      deleteError: "Terjadi kesalahan saat menghapus pelayanan.",
    },
  });

  const handleToggleStatus = (id: number) =>
    runAction(
      () => adminPelayananApi.toggleStatus(id),
      "Status layanan berhasil diubah",
      "Terjadi kesalahan saat mengubah status layanan.",
    );

  return (
    <div
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaLink className="text-blue-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pelayanan
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Layanan
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaLink className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {layananData.length}
            </div>
            <p className="text-sm text-gray-600">Jenis layanan tersedia</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Layanan Aktif
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaCheck className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countAktif}
            </div>
            <p className="text-sm text-gray-600">Layanan yang aktif</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Layanan Nonaktif
              </h3>
              <div className="bg-gray-100 p-2 rounded-lg">
                <FaBan className="text-gray-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countNonaktif}
            </div>
            <p className="text-sm text-gray-600">Layanan yang dinonaktifkan</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "semua"
                  ? "bg-blue-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaLink
                className={
                  activeTab === "semua" ? "text-white" : "text-blue-500"
                }
              />
              <span>Semua Layanan</span>
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
              onClick={() => setActiveTab("nonaktif")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "nonaktif"
                  ? "bg-gray-600 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaBan
                className={
                  activeTab === "nonaktif" ? "text-white" : "text-gray-500"
                }
              />
              <span>Nonaktif</span>
            </button>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar Layanan
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola layanan administrasi desa yang tersedia untuk warga
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus className="text-white" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Memuat data layanan...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchPelayananData}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                      Nama Layanan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Template Surat
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
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {item.nama_layanan}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                          {item.deskripsi}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.id_surat_template ? (
                            <button
                              onClick={() =>
                                handlePreviewTemplate(item.id_surat_template!)
                              }
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium hover:bg-indigo-100 transition-colors"
                              title="Lihat Template Surat"
                            >
                              {getTemplateName(item.id_surat_template)}
                            </button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "aktif"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Tombol Buat Surat (Hanya muncul jika layanan aktif dan punya template) */}
                            {item.status === "aktif" &&
                              item.id_surat_template && (
                                <button
                                  onClick={() =>
                                    setSelectedPelayananForSurat(item)
                                  }
                                  className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                  title="Buatkan Surat untuk Warga"
                                >
                                  <FaFileSignature className="text-blue-600" />
                                </button>
                              )}

                            {item.id_surat_template && (
                              <button
                                onClick={() =>
                                  handlePreviewTemplate(
                                    item.id_surat_template!,
                                  )
                                }
                                className="p-1.5 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                                title="Lihat Template Surat"
                              >
                                <FaEye className="text-purple-600" />
                              </button>
                            )}

                            <button
                              onClick={() => handleEdit(item.id)}
                              className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="p-1.5 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                              title={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              disabled={isActionLoading}
                            >
                              <FaBan className="text-yellow-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
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
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada data layanan yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModal.isOpen && (
        <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Tambah Layanan Baru
              </h3>
              <p className="text-gray-600 text-sm">
                Masukkan informasi layanan yang akan ditambahkan
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="nama_layanan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Layanan
                </label>
                <input
                  id="nama_layanan"
                  type="text"
                  value={formData.nama_layanan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_layanan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama layanan"
                />
              </div>
              <div>
                <label
                  htmlFor="deskripsi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Deskripsi singkat layanan"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="add-id_surat_template"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Template Surat (opsional)
                </label>
                <select
                  id="add-id_surat_template"
                  value={formData.id_surat_template || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_surat_template: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tidak ada template</option>
                  {templates.length > 0 ? (
                    templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.kode} - {tpl.nama_template}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Belum ada template surat
                    </option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Template yang digunakan saat warga mencetak surat lewat
                  layanan ini
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => addModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">Edit Layanan</h3>
              <p className="text-gray-600 text-sm">Ubah informasi layanan</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="edit-nama_layanan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Layanan
                </label>
                <input
                  id="edit-nama_layanan"
                  type="text"
                  value={formData.nama_layanan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_layanan: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-deskripsi"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  id="edit-deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-id_surat_template"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Template Surat (opsional)
                </label>
                <select
                  id="edit-id_surat_template"
                  value={formData.id_surat_template || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      id_surat_template: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tidak ada template</option>
                  {templates.length > 0 ? (
                    templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.kode} - {tpl.nama_template}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Belum ada template surat
                    </option>
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Kosongkan jika ingin mempertahankan template saat ini
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => editModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus layanan "
                {currentItem?.nama_layanan}"? Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
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
      <BuatSuratModal
        isOpen={!!selectedPelayananForSurat}
        onClose={() => setSelectedPelayananForSurat(null)}
        pelayanan={selectedPelayananForSurat}
      />
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        item={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
};

export default PelayananAdmin;
