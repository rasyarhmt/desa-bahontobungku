import { useState } from "react";
import {
  FaFileAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaBan,
  FaSpinner,
  FaUpload,
  FaListUl,
  FaEye,
} from "react-icons/fa";
import { type SuratTemplate } from "@/lib/api/schemas";
import { adminTemplateApi } from "@/lib/api/admin";
import { useAsyncData, useCrudResource } from "@/hooks";
import TemplateFieldModal from "./TemplateFieldModal";
import TemplatePreviewModal from "@/components/admin/TemplatePreviewModal";

interface TemplateFormData {
  kode: string;
  nama_template: string;
  deskripsi: string;
  file_template: File | null;
}

const TemplateSuratAdmin = () => {
  const [activeTab, setActiveTab] = useState("semua");
  const [fieldModalTemplate, setFieldModalTemplate] =
    useState<SuratTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SuratTemplate | null>(
    null,
  );

  const {
    data: templates,
    isLoading,
    error,
    refetch: fetchTemplateData,
  } = useAsyncData<SuratTemplate[]>(
    async () => {
      const data = await adminTemplateApi.getAllTemplates();
      return Array.isArray(data) ? data : [];
    },
    [],
    {
      errorMessage:
        "Gagal memuat data template surat. Silakan coba lagi nanti.",
    },
  );

  const filteredData =
    activeTab === "semua"
      ? templates
      : templates.filter((item) => item.status === activeTab);

  const countAktif = templates.filter((item) => item.status === "aktif").length;
  const countNonaktif = templates.filter(
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
  } = useCrudResource<SuratTemplate, TemplateFormData>({
    items: templates,
    initialForm: {
      kode: "",
      nama_template: "",
      deskripsi: "",
      file_template: null,
    },
    toForm: (item) => ({
      kode: item.kode ?? "",
      nama_template: item.nama_template ?? "",
      deskripsi: item.deskripsi || "",
      file_template: null,
    }),
    validate: (form, mode) => {
      if (mode === "add") {
        if (!form.kode || !form.nama_template) {
          return "Kode dan nama template wajib diisi!";
        }
        if (!form.file_template) {
          return "File template DOCX wajib diupload!";
        }
        return null;
      }
      return form.nama_template ? null : "Nama template wajib diisi!";
    },
    create: (form) => {
      const payload = new FormData();
      payload.append("kode", form.kode.trim());
      payload.append("nama_template", form.nama_template.trim());
      payload.append("deskripsi", form.deskripsi || "");
      payload.append("status", "aktif");
      payload.append("file_template", form.file_template!);
      return adminTemplateApi.addTemplate(payload);
    },
    update: (form, item) => {
      const payload = new FormData();
      payload.append("nama_template", form.nama_template.trim());
      if (form.deskripsi) payload.append("deskripsi", form.deskripsi);
      if (form.file_template)
        payload.append("file_template", form.file_template);
      return adminTemplateApi.updateTemplate(item.id, payload);
    },
    remove: (item) => adminTemplateApi.deleteTemplate(item.id),
    refetch: fetchTemplateData,
    messages: {
      created: "Template surat berhasil ditambahkan",
      updated: "Template surat berhasil diperbarui",
      deleted: "Template surat berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan template.",
      deleteError: "Terjadi kesalahan saat menghapus template.",
    },
  });

  const handleToggleStatus = (id: number) =>
    runAction(
      () => adminTemplateApi.toggleStatus(id),
      "Status template berhasil diubah",
      "Terjadi kesalahan saat mengubah status template.",
    );

  return (
    <div
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FaFileAlt className="text-indigo-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Template Surat
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Template
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FaFileAlt className="text-indigo-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {templates.length}
            </div>
            <p className="text-sm text-gray-600">Jumlah template tersedia</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Template Aktif
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaCheck className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countAktif}
            </div>
            <p className="text-sm text-gray-600">Siap digunakan warga</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Template Nonaktif
              </h3>
              <div className="bg-gray-100 p-2 rounded-lg">
                <FaBan className="text-gray-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countNonaktif}
            </div>
            <p className="text-sm text-gray-600">Template yang nonaktif</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "semua"
                  ? "bg-indigo-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFileAlt
                className={
                  activeTab === "semua" ? "text-white" : "text-indigo-500"
                }
              />
              <span>Semua Template</span>
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

        {/* Templates Table */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar Template
              </h2>
              <p className="text-gray-600 text-sm">
                Template HTML dengan placeholder {"{{ field }}"} untuk surat
                yang dicetak warga
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <FaPlus className="text-white" />
              <span>Tambah Template</span>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-indigo-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Memuat data template...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchTemplateData}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
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
                      Kode
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Nama Template
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      File
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
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-mono font-medium">
                            {item.kode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          {item.nama_template}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                          {item.deskripsi || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.file_template
                            ? item.file_template.split("/").pop()
                            : "-"}
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
                            <button
                              onClick={() => setPreviewTemplate(item)}
                              className="p-1.5 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                              title="Lihat Template"
                            >
                              <FaEye className="text-purple-600" />
                            </button>
                            <button
                              onClick={() => setFieldModalTemplate(item)}
                              className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                              title="Atur Field"
                            >
                              <FaListUl className="text-blue-600" />
                            </button>
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
                        colSpan={7}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada template surat yang ditemukan.
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
                Tambah Template Surat Baru
              </h3>
              <p className="text-gray-600 text-sm">
                Unggah file HTML template yang berisi placeholder{" "}
                {"{{ field }}"}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Template
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) =>
                    setFormData({ ...formData, kode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Contoh: SK_DOMISILI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={formData.nama_template}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama_template: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Contoh: Surat Keterangan Domisili"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Deskripsi singkat template"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Template (.docx)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        file_template: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                {formData.file_template && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <FaCheck size={10} /> {formData.file_template.name} siap
                    diupload
                  </p>
                )}
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <FaUpload size={12} />
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
              <h3 className="text-xl font-bold text-gray-800">
                Edit Template Surat
              </h3>
              <p className="text-gray-600 text-sm">
                Ubah nama, deskripsi, atau ganti file template
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Template
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Kode template tidak dapat diubah
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={formData.nama_template}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nama_template: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ganti File Template (.docx)
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      file_template: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {formData.file_template ? (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <FaCheck size={10} /> {formData.file_template.name} siap
                    diupload
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Kosongkan jika tidak ingin mengganti file
                  </p>
                )}
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
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
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
                Apakah Anda yakin ingin menghapus template "
                {currentItem?.nama_template}"? Tindakan ini tidak dapat
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
      {fieldModalTemplate && (
        <TemplateFieldModal
          templateId={fieldModalTemplate.id}
          templateName={fieldModalTemplate.nama_template}
          onClose={() => setFieldModalTemplate(null)}
        />
      )}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        item={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
};

export default TemplateSuratAdmin;
