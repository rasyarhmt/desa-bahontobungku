"use client";

import { useState } from "react";
import { FaCheck, FaClock, FaNewspaper, FaPlus } from "react-icons/fa";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import BeritaDetailView from "@/components/admin/BeritaDetailView";
import BeritaFormView from "@/components/admin/BeritaFormView";
import BeritaTable from "@/components/admin/BeritaTable";
import {
  AdminFilterTabs,
  AdminMetricCard,
  AdminPageHeader,
  AdminToolbar,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import type { BeritaForm } from "@/components/admin/beritaShared";
import { useAsyncData, useCrudResource, useDisclosure, useSearchFilter } from "@/hooks";
import { adminBeritaApi, type BeritaAdminView } from "@/lib/api/admin";
import { resolveUploadUrl } from "@/lib/api/config";
import { getAuthState } from "@/lib/auth";
import { toDateInputValue } from "@/lib/format";

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
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {addModal.isOpen ? (
          <BeritaFormView
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => void saveNewItem()}
            onCancel={addModal.close}
            isActionLoading={isActionLoading}
          />
        ) : editModal.isOpen ? (
          <BeritaFormView
            isEdit
            formData={formData}
            setFormData={setFormData}
            onSubmit={() => void saveEditedItem()}
            onCancel={editModal.close}
            isActionLoading={isActionLoading}
          />
        ) : previewModal.isOpen && previewItem ? (
          <BeritaDetailView
            item={previewItem}
            onBack={previewModal.close}
            onToggleStatus={(id) => void togglePublishStatus(id)}
            isActionLoading={isActionLoading}
          />
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Manajemen Konten"
              title="Manajemen Berita"
              description="Kelola berita dan artikel website desa."
              actions={
                <button
                  type="button"
                  onClick={handleAdd}
                  className={adminPrimaryButtonClass}
                >
                  <FaPlus />
                  Tambah Berita
                </button>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AdminMetricCard
                label="Total Berita"
                value={beritaData.length}
                icon={<FaNewspaper />}
                hint="Berita tersimpan"
              />
              <AdminMetricCard
                label="Dipublikasi"
                value={countPublished}
                icon={<FaCheck />}
                tone="success"
                hint="Berita dipublikasikan"
              />
              <AdminMetricCard
                label="Draft"
                value={countDraft}
                icon={<FaClock />}
                tone="warning"
                hint="Berita dalam draft"
              />
            </div>

            <AdminToolbar>
              <AdminFilterTabs<string>
                tabs={[
                  {
                    value: "semua",
                    label: "Semua Berita",
                    count: beritaData.length,
                  },
                  {
                    value: "dipublikasi",
                    label: "Dipublikasi",
                    count: countPublished,
                  },
                  { value: "draft", label: "Draft", count: countDraft },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </AdminToolbar>

            <BeritaTable
              items={filteredData}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onRetry={() => void fetchBeritaData()}
              onAdd={handleAdd}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={(id) => void togglePublishStatus(id)}
            />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus berita?"
        description={`Apakah Anda yakin ingin menghapus berita "${currentItem?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />
    </div>
  );
};

export default BeritaAdmin;
