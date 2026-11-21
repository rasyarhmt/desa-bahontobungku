"use client";

import { useState } from "react";
import { LoaderCircle, Newspaper } from "lucide-react";
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
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
            <Newspaper className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Berita</h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Berita
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
                <Newspaper className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {beritaData.length}
            </div>
            <p className="text-sm text-slate-600">Berita tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Dipublikasi
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Newspaper className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countPublished}
            </div>
            <p className="text-sm text-slate-600">Berita dipublikasikan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Draft</h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Newspaper className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countDraft}
            </div>
            <p className="text-sm text-slate-600">Berita dalam draft</p>
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
              <Newspaper className="size-5" aria-hidden="true" />
              <span>Semua Berita</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dipublikasi")}
              aria-pressed={activeTab === "dipublikasi"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "dipublikasi"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Newspaper className="size-5" aria-hidden="true" />
              <span>Dipublikasi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              aria-pressed={activeTab === "draft"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "draft"
                  ? "bg-amber-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Newspaper className="size-5" aria-hidden="true" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus berita &quot;
                {currentItem?.judul}&quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => deleteModal.close()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                disabled={isActionLoading}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-base font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <>
                    <LoaderCircle
                      className="size-5 animate-spin"
                      aria-hidden="true"
                    />
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
