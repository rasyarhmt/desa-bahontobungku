"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaChartBar,
  FaChartPie,
  FaFileAlt,
  FaImage,
  FaList,
  FaSearch,
  FaSpinner,
  FaSyncAlt,
  FaTh,
  FaVideo,
} from "react-icons/fa";

import AdminTablePagination from "@/components/admin/AdminTablePagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MediaFormModal from "@/components/admin/MediaFormModal";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";
import MediaTable from "@/components/admin/MediaTable";
import type { MediaViewMode } from "@/components/admin/MediaTable";
import ModalPortal from "@/components/admin/ModalPortal";
import {
  AdminPageHeader,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import type { MediaFormState, MediaItem } from "@/components/admin/mediaShared";
import {
  useAsyncData,
  useCrudResource,
  useDisclosure,
  useTablePagination,
  useThumbnailExtraction,
} from "@/hooks";
import { adminMediaApi } from "@/lib/api/admin";
import { type Media } from "@/lib/api/schemas";
import { toast } from "@/lib/toast";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mkv"];
const PDF_EXTENSIONS = ["pdf"];

const getExtension = (name: string) => name.split(".").pop()!.toLowerCase();

const isValidMediaFile = (tipe: string, ext: string) => {
  if (tipe === "foto") return IMAGE_EXTENSIONS.includes(ext);
  if (tipe === "video") return VIDEO_EXTENSIONS.includes(ext);
  if (tipe === "dokumen") return PDF_EXTENSIONS.includes(ext);
  return false;
};

const mapApiItem = (item: Media): MediaItem => ({
  ...item,
  tipe: item.tipe ?? "",
});

const MediaAdmin = () => {
  const {
    data: mediaData,
    isLoading,
    error,
    refetch: fetchMediaData,
  } = useAsyncData<MediaItem[]>(
    async () => {
      const data = await adminMediaApi.getAllMedia();
      return data.map(mapApiItem);
    },
    [],
    { errorMessage: "Gagal memuat data media. Silakan coba lagi nanti." },
  );

  const [activeTab, setActiveTab] = useState("semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<MediaViewMode>("tabel");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setBulkDeleting] = useState(false);

  const previewModal = useDisclosure();
  const bulkDeleteModal = useDisclosure();
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const { isThumbnailLoading, extractThumbnail } = useThumbnailExtraction();

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
  } = useCrudResource<MediaItem, MediaFormState>({
    items: mediaData,
    initialForm: {
      nama: "",
      tipe: "foto",
      deskripsi: "",
      file: null,
      thumbnail: null,
    },
    toForm: (item) => ({
      nama: item.nama ?? "",
      tipe: item.tipe ?? "",
      deskripsi: item.deskripsi ?? "",
      file: null,
      thumbnail: null,
    }),
    validate: (form, mode) => {
      if (!form.nama || !form.deskripsi) {
        return "Nama dan deskripsi wajib diisi!";
      }
      if (mode === "add" && !form.file) {
        return "File media wajib diunggah!";
      }
      if (
        form.file &&
        !isValidMediaFile(form.tipe, getExtension(form.file.name))
      ) {
        return `Format file tidak sesuai dengan tipe media ${form.tipe} yang dipilih!`;
      }
      if (
        form.tipe === "video" &&
        form.thumbnail &&
        !IMAGE_EXTENSIONS.includes(getExtension(form.thumbnail.name))
      ) {
        return "Format thumbnail harus berupa gambar (JPG, JPEG, PNG, GIF, WEBP)";
      }
      return null;
    },
    create: async (form) => {
      const payload = new FormData();
      payload.append("nama", form.nama);
      payload.append("tipe", form.tipe);
      payload.append("deskripsi", form.deskripsi);
      payload.append("file", form.file!);

      if (form.tipe === "video") {
        const thumbnail =
          form.thumbnail ?? (await extractThumbnail(form.file!));
        if (thumbnail) payload.append("thumbnail", thumbnail);
      }

      return adminMediaApi.addMedia(payload);
    },
    update: async (form, item) => {
      const payload = new FormData();
      payload.append("nama", form.nama);
      payload.append("tipe", form.tipe);
      payload.append("deskripsi", form.deskripsi);

      if (form.file) {
        payload.append("file", form.file);
        if (form.tipe === "video" && !form.thumbnail && !item.thumbnail) {
          const thumbnail = await extractThumbnail(form.file);
          if (thumbnail) payload.append("thumbnail", thumbnail);
        }
      }

      if (form.tipe === "video" && form.thumbnail) {
        payload.append("thumbnail", form.thumbnail);
      }

      return adminMediaApi.updateMedia(item.id, payload);
    },
    remove: (item) => adminMediaApi.deleteMedia(item.id),
    refetch: fetchMediaData,
    messages: {
      created: "Media berhasil ditambahkan",
      updated: "Media berhasil diperbarui",
      deleted: "Media berhasil dihapus",
      saveError: "Terjadi kesalahan saat menyimpan media.",
      deleteError: "Terjadi kesalahan saat menghapus media.",
    },
  });

  const counts = useMemo(() => {
    const foto = mediaData.filter((item) => item.tipe === "foto").length;
    const video = mediaData.filter((item) => item.tipe === "video").length;
    const dokumen = mediaData.filter((item) => item.tipe === "dokumen").length;
    return { total: mediaData.length, foto, video, dokumen };
  }, [mediaData]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return mediaData.filter((item) => {
      const matchesType =
        activeTab === "semua" ||
        (item.tipe ?? "").toLowerCase() === activeTab.toLowerCase();
      const matchesQuery =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        (item.deskripsi ?? "").toLowerCase().includes(query);
      return matchesType && matchesQuery;
    });
  }, [mediaData, activeTab, searchTerm]);

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageItems,
    totalItems,
    totalPages,
  } = useTablePagination(filteredData, {
    resetKey: `${activeTab}|${searchTerm}`,
  });

  const visibleIds = pageItems.map((item) => item.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab, searchTerm, page]);

  useEffect(() => {
    setSelectedIds((previous) =>
      previous.filter((id) => mediaData.some((item) => item.id === id)),
    );
  }, [mediaData]);

  const handlePreview = (id: number) => {
    const item = mediaData.find((media) => media.id === id);
    if (item) {
      setPreviewItem(item);
      previewModal.open();
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  };

  const toggleAllVisible = () => {
    setSelectedIds((previous) =>
      allVisibleSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...previous, ...visibleIds])),
    );
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => adminMediaApi.deleteMedia(id)));
      await fetchMediaData();
      toast.success(`${selectedIds.length} media berhasil dihapus.`);
      setSelectedIds([]);
      bulkDeleteModal.close();
    } catch {
      toast.error("Terjadi kesalahan saat menghapus media terpilih.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const percentage = (value: number) =>
    counts.total === 0 ? 0 : (value / counts.total) * 100;

  const tabs = [
    {
      value: "semua",
      label: "Semua Media",
      count: counts.total,
      icon: <FaChartBar />,
    },
    { value: "foto", label: "Foto", count: counts.foto, icon: <FaImage /> },
    { value: "video", label: "Video", count: counts.video, icon: <FaVideo /> },
    {
      value: "dokumen",
      label: "Dokumen",
      count: counts.dokumen,
      icon: <FaFileAlt />,
    },
  ];

  const metrics = [
    {
      label: "Total Media",
      value: counts.total,
      icon: <FaChartBar />,
      iconClass: "bg-primary-fixed text-on-primary-fixed",
    },
    {
      label: "Foto",
      value: counts.foto,
      icon: <FaImage />,
      iconClass: "bg-secondary-container text-on-secondary-container",
    },
    {
      label: "Video",
      value: counts.video,
      icon: <FaVideo />,
      iconClass: "bg-surface-container-high text-primary",
    },
    {
      label: "Dokumen",
      value: counts.dokumen,
      icon: <FaFileAlt />,
      iconClass: "bg-[var(--warning-bg)] text-[var(--warning-fg)]",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Manajemen Konten"
        title="Pusat Data Multimoda"
        description="Manajemen media & berkas digital desa."
        actions={
          <button
            type="button"
            onClick={() => void fetchMediaData()}
            className={adminSecondaryButtonClass}
          >
            <FaSyncAlt />
            Muat Ulang
          </button>
        }
        onAdd={handleAdd}
        addLabel="Tambah Media"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="rounded-3xl border border-border bg-surface-container-lowest p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${metric.iconClass}`}
              >
                {metric.icon}
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-on-surface">
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-container text-primary">
            <FaChartPie />
          </span>
          <div>
            <h2 className="text-base font-semibold text-on-surface">
              Komposisi Media
            </h2>
            <p className="text-xs text-muted-foreground">
              Distribusi berkas berdasarkan tipe yang tersimpan.
            </p>
          </div>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="bg-primary transition-all"
            style={{ width: `${percentage(counts.foto)}%` }}
          />
          <div
            className="bg-[#68dba9] transition-all"
            style={{ width: `${percentage(counts.video)}%` }}
          />
          <div
            className="bg-amber-500 transition-all"
            style={{ width: `${percentage(counts.dokumen)}%` }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-on-surface-variant">
          <span>Foto: {counts.foto}</span>
          <span>Video: {counts.video}</span>
          <span>Dokumen: {counts.dokumen}</span>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[11px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Cari nama atau deskripsi..."
                aria-label="Cari media"
                className="w-full rounded-xl border border-border bg-surface-container-lowest py-2.5 pl-10 pr-3 text-sm text-on-surface placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-72"
              />
            </label>
            <div className="flex rounded-xl border border-border bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => setViewMode("tabel")}
                aria-label="Tampilan tabel"
                title="Tampilan tabel"
                className={`rounded-lg p-2 transition-colors ${
                  viewMode === "tabel"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                <FaList />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Tampilan grid"
                title="Tampilan grid"
                className={`rounded-lg p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-muted-foreground hover:text-on-surface"
                }`}
              >
                <FaTh />
              </button>
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary-fixed px-4 py-3 text-on-primary-fixed">
            <p className="text-sm font-medium">
              {selectedIds.length} media dipilih
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-xl bg-white/20 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/30"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={bulkDeleteModal.open}
                className="rounded-xl bg-white/25 px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-white/35"
              >
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}
      </section>

      <MediaTable
        items={pageItems}
        viewMode={viewMode}
        selectedIds={selectedIds}
        allVisibleSelected={allVisibleSelected}
        isLoading={isLoading}
        error={error}
        onRetry={() => void fetchMediaData()}
        onPreview={handlePreview}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAllVisible}
        footer={
          <AdminTablePagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            label="media"
          />
        }
      />

      <MediaFormModal
        isOpen={addModal.isOpen}
        isEdit={false}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => void saveNewItem()}
        onCancel={addModal.close}
        currentItem={currentItem}
        isLoading={isActionLoading}
      />

      <MediaFormModal
        isOpen={editModal.isOpen}
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        onSubmit={() => void saveEditedItem()}
        onCancel={editModal.close}
        currentItem={currentItem}
        isLoading={isActionLoading}
      />

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        title="Hapus media?"
        description={`Media "${currentItem?.nama ?? ""}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={deleteModal.close}
      />

      <ConfirmDialog
        isOpen={bulkDeleteModal.isOpen}
        title="Hapus media terpilih?"
        description={`${selectedIds.length} media akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isBulkDeleting}
        onConfirm={() => void confirmBulkDelete()}
        onCancel={bulkDeleteModal.close}
      />

      <MediaPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
      />

      {isThumbnailLoading && (
        <ModalPortal>
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-inverse-surface/50 backdrop-blur-sm">
            <div className="rounded-3xl border border-border bg-surface-container-lowest px-8 py-6 text-center shadow-2xl">
              <FaSpinner className="mx-auto mb-4 animate-spin text-3xl text-primary" />
              <p className="text-sm font-semibold text-on-surface">
                Menghasilkan thumbnail dari video...
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mohon tunggu sebentar.
              </p>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default MediaAdmin;
