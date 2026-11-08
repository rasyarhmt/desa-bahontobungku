"use client";

import { useState } from "react";
import {
  FaImage,
  FaVideo,
  FaFileAlt,
  FaChartBar,
  FaSpinner,
} from "react-icons/fa";

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
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaChartBar className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Media</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Media
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaFileAlt className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {mediaData.length}
            </div>
            <p className="text-sm text-gray-600">Item media tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Foto</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaImage className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countFoto}
            </div>
            <p className="text-sm text-gray-600">Foto tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Video</h3>
              <div className="bg-red-100 p-2 rounded-lg">
                <FaVideo className="text-red-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countVideo}
            </div>
            <p className="text-sm text-gray-600">Video tersimpan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Dokumen</h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FaFileAlt className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countDokumen}
            </div>
            <p className="text-sm text-gray-600">Dokumen tersimpan</p>
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
              <FaFileAlt
                className={
                  activeTab === "semua" ? "text-white" : "text-purple-500"
                }
              />
              <span>Semua Media</span>
            </button>
            <button
              onClick={() => setActiveTab("foto")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "foto"
                  ? "bg-blue-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaImage
                className={
                  activeTab === "foto" ? "text-white" : "text-blue-500"
                }
              />
              <span>Foto</span>
            </button>
            <button
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "video"
                  ? "bg-red-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaVideo
                className={
                  activeTab === "video" ? "text-white" : "text-red-500"
                }
              />
              <span>Video</span>
            </button>
            <button
              onClick={() => setActiveTab("dokumen")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === "dokumen"
                  ? "bg-yellow-500 text-white font-medium shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FaFileAlt
                className={
                  activeTab === "dokumen" ? "text-white" : "text-yellow-500"
                }
              />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8">
          <div
            className="fixed inset-0 backdrop-blur-sm bg-gray-700/30"
            onClick={() => deleteModal.close()}
          ></div>

          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus media &quot;{currentItem?.nama}
                &quot;? Tindakan ini tidak dapat dibatalkan.
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

      <MediaPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
      />

      {isThumbnailLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-700/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
            <p className="text-gray-800 font-medium">
              Menghasilkan thumbnail dari video...
            </p>
            <p className="text-gray-600 text-sm mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAdmin;
