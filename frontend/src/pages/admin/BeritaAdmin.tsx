"use client";

import { useState } from "react";
import { FaNewspaper, FaSpinner } from "react-icons/fa";
import { adminBeritaApi, type BeritaAdminView } from "@/lib/api/admin";
import { resolveUploadUrl } from "@/lib/api/config";
import { getAuthState } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";
import { useAsyncData, useCrudResource, useDisclosure, useSearchFilter } from "@/hooks";
import BeritaTable from "@/components/admin/BeritaTable";
import BeritaFormModal from "@/components/admin/BeritaFormModal";
import BeritaPreviewModal from "@/components/admin/BeritaPreviewModal";
import type { BeritaForm } from "@/components/admin/beritaShared";

const BeritaAdmin = () => {
  const { token } = getAuthState();

  const {
    data: beritaData,
    isLoading,
    error,
    refetch: fetchBeritaData,
  } = useAsyncData<BeritaAdminView[]>(
    async () => {
      const data = await adminBeritaApi.getAllBerita();
      return data;
    },
    [],
    { errorMessage: "Gagal memuat data berita." },
  );

  const [activeTab, setActiveTab] = useState("semua");

  const previewModal = useDisclosure();
  const [previewItem, setPreviewItem] = useState<BeritaAdminView | null>(null);

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    filtered: filteredData,
  } = useSearchFilter(beritaData, (item, query) => {
    const q = query.toLowerCase();
    const matchesSearch =
      (item.judul?.toLowerCase() || "").includes(q) ||
      (item.penulis?.toLowerCase() || "").includes(q);

    const matchesFilter =
      activeTab === "semua" ||
      (activeTab === "dipublikasi" && item.status === "Dipublikasi") ||
      (activeTab === "draft" && item.status === "Draft");

    return matchesSearch && matchesFilter;
  });

  const countPublished = beritaData.filter(
    (item) => item.status === "Dipublikasi"
  ).length;
  const countDraft = beritaData.filter(
    (item) => item.status === "Draft"
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
  } = useCrudResource<BeritaAdminView, BeritaForm>({
    items: beritaData,
    initialForm: {
      judul: "",
      tanggalTerbit: toDateInputValue(new Date()),
      penulis: "Admin",
      status: "Draft",
      isi: "",
      foto: null,
      fotoPreview: null,
      deleteFoto: false,
      originalFoto: null,
    },
    toForm: (item) => ({
      judul: item.judul || "",
      tanggalTerbit: item.tanggalTerbit
        ? toDateInputValue(item.tanggalTerbit) || item.tanggalTerbit
        : toDateInputValue(new Date()),
      penulis: item.penulis || "",
      status: item.status || "Draft",
      isi: item.isi || "",
      foto: null,
      fotoPreview: item.foto ? resolveUploadUrl(item.foto) : null,
      deleteFoto: false,
      originalFoto: item.foto,
    }),
    validate: (form) =>
      !form.judul || !form.isi || !form.tanggalTerbit || !form.penulis
        ? "Judul, isi, tanggal terbit, dan penulis wajib diisi!"
        : null,
    guard: () =>
      token ? null : "Anda harus login sebagai admin untuk mengelola berita",
    create: (form) =>
      adminBeritaApi.addBerita({
        judul: form.judul,
        isi: form.isi,
        tanggalTerbit: form.tanggalTerbit,
        penulis: form.penulis,
        status: form.status,
        foto: form.foto,
      }),
    update: (form, item) =>
      adminBeritaApi.updateBerita(item.id, {
        judul: form.judul,
        isi: form.isi,
        tanggalTerbit: form.tanggalTerbit,
        penulis: form.penulis,
        status: form.status,
        foto: form.foto,
        deleteFoto: form.deleteFoto,
      }),
    remove: (item) => adminBeritaApi.deleteBerita(item.id),
    refetch: fetchBeritaData,
    messages: {
      created: "Berita berhasil ditambahkan",
      updated: "Berita berhasil diperbarui",
      deleted: "Berita berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan berita.",
      deleteError: "Terjadi kesalahan saat menghapus berita.",
    },
  });

  const handlePreview = (id: number) => {
    const item = beritaData.find((item) => item.id === id);
    if (item) {
      setPreviewItem(item);
      previewModal.open();
    }
  };

  const togglePublishStatus = async (id: number) => {
    const item = beritaData.find((item) => item.id === id);
    if (!item) return;

    const newStatus = item.status === "Dipublikasi" ? "Draft" : "Dipublikasi";

    const ok = await runAction(
      () => adminBeritaApi.toggleStatus(id),
      `Berita berhasil ${
        newStatus === "Dipublikasi" ? "dipublikasikan" : "diubah ke draft"
      }`,
      "Terjadi kesalahan saat mengubah status publikasi berita.",
    );

    if (ok && previewItem?.id === id) {
      setPreviewItem({
        ...previewItem,
        status: newStatus as "Dipublikasi" | "Draft",
      });
    }
  };

  return (
    <div
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaNewspaper className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Berita</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Berita
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaNewspaper className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {beritaData.length}
            </div>
            <p className="text-sm text-gray-600">Berita tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Dipublikasi
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaNewspaper className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countPublished}
            </div>
            <p className="text-sm text-gray-600">Berita dipublikasikan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Draft</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FaNewspaper className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countDraft}
            </div>
            <p className="text-sm text-gray-600">Berita dalam draft</p>
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
              <FaNewspaper
                className={
                  activeTab === "semua" ? "text-white" : "text-purple-500"
                }
              />
              <span>Semua Berita</span>
            </button>
            <button
              onClick={() => setActiveTab("dipublikasi")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "dipublikasi"
                  ? "bg-green-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaNewspaper
                className={
                  activeTab === "dipublikasi" ? "text-white" : "text-green-500"
                }
              />
              <span>Dipublikasi</span>
            </button>
            <button
              onClick={() => setActiveTab("draft")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "draft"
                  ? "bg-yellow-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaNewspaper
                className={
                  activeTab === "draft" ? "text-white" : "text-yellow-500"
                }
              />
              <span>Draft</span>
            </button>
          </div>
        </div>

        <BeritaTable
          items={filteredData}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRetry={fetchBeritaData}
          onAdd={handleAdd}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={togglePublishStatus}
        />
      </div>

      <BeritaFormModal
        isOpen={addModal.isOpen}
        isEdit={false}
        formData={formData}
        setFormData={setFormData}
        onSubmit={saveNewItem}
        onCancel={addModal.close}
        isActionLoading={isActionLoading}
      />

      <BeritaFormModal
        isOpen={editModal.isOpen}
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        onSubmit={saveEditedItem}
        onCancel={editModal.close}
        isActionLoading={isActionLoading}
      />

      {deleteModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md border border-gray-200 animate-modalFadeIn">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus berita &quot;
                {currentItem?.judul}&quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => deleteModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BeritaPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
        onToggleStatus={togglePublishStatus}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};

export default BeritaAdmin;
