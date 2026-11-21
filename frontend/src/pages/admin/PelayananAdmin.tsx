import { useState } from "react";
import {
  Ban,
  Check,
  Eye,
  FilePenLine,
  Link2,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
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
    <div className="w-full text-slate-900">
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
            <Link2 aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Manajemen Pelayanan
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Layanan
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
                <Link2 aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {layananData.length}
            </div>
            <p className="text-base text-slate-600">Jenis layanan tersedia</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Layanan Aktif
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Check aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countAktif}
            </div>
            <p className="text-base text-slate-600">Layanan yang aktif</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Layanan Nonaktif
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Ban aria-hidden="true" className="size-5" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countNonaktif}
            </div>
            <p className="text-base text-slate-600">
              Layanan yang dinonaktifkan
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("semua")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "semua"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Link2 aria-hidden="true" className="size-5" />
              <span>Semua Layanan</span>
            </button>
            <button
              onClick={() => setActiveTab("aktif")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "aktif"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Check aria-hidden="true" className="size-5" />
              <span>Aktif</span>
            </button>
            <button
              onClick={() => setActiveTab("nonaktif")}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === "nonaktif"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Ban aria-hidden="true" className="size-5" />
              <span>Nonaktif</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Daftar Layanan
              </h2>
              <p className="text-base text-slate-600">
                Kelola layanan administrasi desa yang tersedia untuk warga
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
            >
              <Plus aria-hidden="true" className="size-5" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <LoaderCircle
                aria-hidden="true"
                className="mx-auto mb-4 size-5 animate-spin text-[#0b6393]"
              />
              <p className="text-base text-slate-600">Memuat data layanan...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-base text-red-700">
              <p>{error}</p>
              <button
                onClick={fetchPelayananData}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                      ID
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                      Nama Layanan
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                      Deskripsi
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                      Template Surat
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-slate-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-4 text-base text-slate-800">
                          {item.id}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          <div className="flex flex-col">
                            <div className="font-semibold">
                              {item.nama_layanan}
                            </div>
                          </div>
                        </td>
                        <td className="max-w-xs px-4 py-4 text-base text-slate-800">
                          {item.deskripsi}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          {item.id_surat_template ? (
                            <button
                              onClick={() =>
                                handlePreviewTemplate(item.id_surat_template!)
                              }
                              className="inline-flex min-h-11 items-center rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-[#0b6393] hover:bg-sky-100"
                              title="Lihat Template Surat"
                            >
                              {getTemplateName(item.id_surat_template)}
                            </button>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-base text-slate-800">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                              item.status === "aktif"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {item.status === "aktif" &&
                              item.id_surat_template && (
                                <button
                                  onClick={() =>
                                    setSelectedPelayananForSurat(item)
                                  }
                                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-[#0b6393] hover:bg-sky-100"
                                  title="Buatkan Surat untuk Warga"
                                  aria-label="Buatkan Surat untuk Warga"
                                >
                                  <FilePenLine
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                  <span>Buat Surat</span>
                                </button>
                              )}

                            {item.id_surat_template && (
                              <button
                                onClick={() =>
                                  handlePreviewTemplate(
                                    item.id_surat_template!,
                                  )
                                }
                                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                                title="Lihat Template Surat"
                                aria-label="Lihat Template Surat"
                              >
                                <Eye aria-hidden="true" className="size-5" />
                                <span>Lihat Template</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleEdit(item.id)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Pencil aria-hidden="true" className="size-5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                              title={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              aria-label={
                                item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"
                              }
                              disabled={isActionLoading}
                            >
                              <Ban aria-hidden="true" className="size-5" />
                              <span>
                                {item.status === "aktif"
                                  ? "Nonaktifkan"
                                  : "Aktifkan"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                              title="Hapus"
                              aria-label="Hapus"
                            >
                              <Trash2 aria-hidden="true" className="size-5" />
                              <span>Hapus</span>
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

      {addModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Tambah Layanan Baru
              </h3>
              <p className="text-base text-slate-600">
                Masukkan informasi layanan yang akan ditambahkan
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="nama_layanan"
                  className="mb-1 block text-sm font-semibold text-slate-700"
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Nama layanan"
                />
              </div>
              <div>
                <label
                  htmlFor="deskripsi"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Deskripsi singkat layanan"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="add-id_surat_template"
                  className="mb-1 block text-sm font-semibold text-slate-700"
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
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
                <p className="mt-1 text-sm text-slate-600">
                  Template yang digunakan saat warga mencetak surat lewat
                  layanan ini
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => addModal.close()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={saveNewItem}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Edit Layanan</h3>
              <p className="text-base text-slate-600">Ubah informasi layanan</p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="edit-nama_layanan"
                  className="mb-1 block text-sm font-semibold text-slate-700"
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-deskripsi"
                  className="mb-1 block text-sm font-semibold text-slate-700"
                >
                  Deskripsi
                </label>
                <textarea
                  id="edit-deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="edit-id_surat_template"
                  className="mb-1 block text-sm font-semibold text-slate-700"
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
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
                <p className="mt-1 text-sm text-slate-600">
                  Kosongkan jika ingin mempertahankan template saat ini
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => editModal.close()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={saveEditedItem}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus layanan "
                {currentItem?.nama_layanan}"? Tindakan ini tidak dapat
                dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
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
