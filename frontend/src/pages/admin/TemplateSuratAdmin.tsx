import { useState } from "react";
import {
  Ban,
  Check,
  Eye,
  FileText,
  List,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
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
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#0b6393]/10">
            <FileText
              className="size-5 text-[#0b6393]"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Template Surat
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Template
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#0b6393]/10">
                <FileText
                  className="size-5 text-[#0b6393]"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {templates.length}
            </div>
            <p className="text-base text-slate-600">
              Jumlah template tersedia
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Template Aktif
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                <Check
                  className="size-5 text-emerald-700"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countAktif}
            </div>
            <p className="text-base text-slate-600">Siap digunakan warga</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Template Nonaktif
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100">
                <Ban className="size-5 text-slate-600" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countNonaktif}
            </div>
            <p className="text-base text-slate-600">Template yang nonaktif</p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "semua"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <FileText
                className={`size-5 ${activeTab === "semua" ? "" : "text-[#0b6393]"}`}
                aria-hidden="true"
              />
              <span>Semua Template</span>
            </button>
            <button
              onClick={() => setActiveTab("aktif")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "aktif"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Check
                className={`size-5 ${activeTab === "aktif" ? "" : "text-emerald-700"}`}
                aria-hidden="true"
              />
              <span>Aktif</span>
            </button>
            <button
              onClick={() => setActiveTab("nonaktif")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "nonaktif"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Ban
                className={`size-5 ${activeTab === "nonaktif" ? "" : "text-slate-600"}`}
                aria-hidden="true"
              />
              <span>Nonaktif</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Daftar Template
              </h2>
              <p className="text-base text-slate-600">
                Template HTML dengan placeholder {"{{ field }}"} untuk surat
                yang dicetak warga
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73]"
            >
              <Plus className="size-5" aria-hidden="true" />
              <span>Tambah Template</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <LoaderCircle
                className="mx-auto mb-4 size-8 animate-spin text-[#0b6393]"
                aria-hidden="true"
              />
              <p className="text-base text-slate-600">Memuat data template...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-700">
              <p className="text-base">{error}</p>
              <button
                onClick={fetchTemplateData}
                className="mt-4 min-h-11 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73]"
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
                      Kode
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Nama Template
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Deskripsi
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      File
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
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-900">{item.id}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-800">
                            {item.kode}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          {item.nama_template}
                        </td>
                        <td className="max-w-xs px-4 py-4 text-slate-700">
                          {item.deskripsi || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {item.file_template
                            ? item.file_template.split("/").pop()
                            : "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              item.status === "aktif"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setPreviewTemplate(item)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393] transition-colors hover:bg-sky-100"
                              aria-label="Lihat Template"
                              title="Lihat Template"
                            >
                              <Eye className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => setFieldModalTemplate(item)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#0b6393]/10 text-[#0b6393] transition-colors hover:bg-[#0b6393]/20"
                              aria-label="Atur Field"
                              title="Atur Field"
                            >
                              <List className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200"
                              aria-label="Edit"
                              title="Edit"
                            >
                              <Pencil className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50"
                              aria-label={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              title={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              disabled={isActionLoading}
                            >
                              <Ban className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-red-50 text-red-700 transition-colors hover:bg-red-100"
                              aria-label="Hapus"
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
                        colSpan={7}
                        className="px-4 py-4 text-center text-base text-slate-600"
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

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Tambah Template Surat Baru
              </h3>
              <p className="text-base text-slate-600">
                Unggah file HTML template yang berisi placeholder{" "}
                {"{{ field }}"}
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
                  Kode Template
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) =>
                    setFormData({ ...formData, kode: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Contoh: SK_DOMISILI"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Contoh: Surat Keterangan Domisili"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Deskripsi singkat template"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
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
                    className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
                {formData.file_template && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Check className="size-5" aria-hidden="true" />
                    {formData.file_template.name} siap diupload
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => addModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73]"
              >
                <Upload className="size-5" aria-hidden="true" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Edit Template Surat
              </h3>
              <p className="text-base text-slate-600">
                Ubah nama, deskripsi, atau ganti file template
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
                  Kode Template
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  disabled
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 text-base text-slate-600"
                />
                <p className="mt-2 text-sm text-slate-600">
                  Kode template tidak dapat diubah
                </p>
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                />
                {formData.file_template ? (
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Check className="size-5" aria-hidden="true" />
                    {formData.file_template.name} siap diupload
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">
                    Kosongkan jika tidak ingin mengganti file
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => editModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="min-h-11 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus template "
                {currentItem?.nama_template}"? Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="min-h-11 rounded-xl bg-red-700 px-4 text-base font-semibold text-white transition-colors hover:bg-red-800"
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
