"use client";

import { useState } from "react";
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Video,
} from "lucide-react";

import { adminMediaApi } from "@/lib/api/admin";
import { type Media } from "@/lib/api/schemas";
import { useAsyncData, useCrudResource, useDisclosure } from "@/hooks";
import { useThumbnailExtraction } from "@/hooks";
import MediaTable from "@/components/admin/MediaTable";
import MediaFormModal from "@/components/admin/MediaFormModal";
import MediaPreviewModal from "@/components/admin/MediaPreviewModal";
import type {
  MediaFormState,
  MediaItem,
} from "@/components/admin/mediaShared";

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

  const previewModal = useDisclosure();
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  const { isThumbnailLoading, extractThumbnail } = useThumbnailExtraction();

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

  const handlePreview = (id: number) => {
    const item = mediaData.find((item) => item.id === id);
    if (item) {
      setPreviewItem(item);
      previewModal.open();
    }
  };

  const filteredData =
    activeTab === "semua"
      ? mediaData
      : mediaData.filter(
          (item) => (item.tipe ?? "").toLowerCase() === activeTab.toLowerCase(),
        );

  const countFoto = mediaData.filter((item) => item.tipe === "foto").length;
  const countVideo = mediaData.filter((item) => item.tipe === "video").length;
  const countDokumen = mediaData.filter(
    (item) => item.tipe === "dokumen",
  ).length;

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
            <BarChart3 className="size-5" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Media</h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Media
              </h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
                <FileText className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {mediaData.length}
            </div>
            <p className="text-sm text-slate-600">Item media tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Foto</h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e6f1f7] text-[#0b6393]">
                <ImageIcon className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countFoto}
            </div>
            <p className="text-sm text-slate-600">Foto tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Video</h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <Video className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countVideo}
            </div>
            <p className="text-sm text-slate-600">Video tersimpan</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Dokumen</h3>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <FileText className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countDokumen}
            </div>
            <p className="text-sm text-slate-600">Dokumen tersimpan</p>
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
              <FileText className="size-5" aria-hidden="true" />
              <span>Semua Media</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("foto")}
              aria-pressed={activeTab === "foto"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "foto"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <ImageIcon className="size-5" aria-hidden="true" />
              <span>Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              aria-pressed={activeTab === "video"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "video"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Video className="size-5" aria-hidden="true" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dokumen")}
              aria-pressed={activeTab === "dokumen"}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                activeTab === "dokumen"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <FileText className="size-5" aria-hidden="true" />
              <span>Dokumen</span>
            </button>
          </div>
        </div>

        <MediaTable
          items={filteredData}
          isLoading={isLoading}
          error={error}
          onRetry={fetchMediaData}
          onAdd={handleAdd}
          onPreview={handlePreview}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <MediaFormModal
        isOpen={addModal.isOpen}
        isEdit={false}
        formData={formData}
        setFormData={setFormData}
        onSubmit={saveNewItem}
        onCancel={addModal.close}
        currentItem={currentItem}
      />

      <MediaFormModal
        isOpen={editModal.isOpen}
        isEdit={true}
        formData={formData}
        setFormData={setFormData}
        onSubmit={saveEditedItem}
        onCancel={editModal.close}
        currentItem={currentItem}
      />

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => deleteModal.close()}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus media &quot;{currentItem?.nama}
                &quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => deleteModal.close()}
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

      <MediaPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
      />

      {isThumbnailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl">
            <LoaderCircle
              className="mx-auto mb-4 block size-5 animate-spin text-[#0b6393]"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-slate-900">
              Menghasilkan thumbnail dari video...
            </p>
            <p className="mt-2 text-base text-slate-600">
              Mohon tunggu sebentar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAdmin;
