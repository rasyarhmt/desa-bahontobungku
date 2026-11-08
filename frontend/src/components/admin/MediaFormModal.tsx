import type { Dispatch, SetStateAction } from "react";

import { adminMediaUtils } from "@/lib/api/admin";

import type { MediaFormState, MediaItem } from "./mediaShared";

interface MediaFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: MediaFormState;
  setFormData: Dispatch<SetStateAction<MediaFormState>>;
  onSubmit: () => void;
  onCancel: () => void;
  currentItem: MediaItem | null;
}

const getAccept = (tipe: string) =>
  tipe === "foto"
    ? "image/jpeg,image/png,image/jpg"
    : tipe === "video"
      ? "video/mp4,video/mkv,video/webm"
      : "application/pdf";

const getFileHint = (tipe: string) =>
  tipe === "foto"
    ? "Format yang didukung: JPG, JPEG, PNG"
    : tipe === "video"
      ? "Format yang didukung: MP4, MKV, WEBM"
      : "Format yang didukung: PDF";

const fileInputClass = (isEdit: boolean) =>
  isEdit
    ? "w-full border border-gray-300 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
    : "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

const fieldInputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

export default function MediaFormModal({
  isOpen,
  isEdit,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  currentItem,
}: MediaFormModalProps) {
  if (!isOpen) return null;

  const idPrefix = isEdit ? "edit-" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-8">
      <div
        className="fixed inset-0 backdrop-blur-sm bg-gray-700/30"
        onClick={onCancel}
      ></div>

      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Media" : "Tambah Media Baru"}
          </h3>
          <p className="text-gray-600 text-sm">
            {isEdit
              ? "Ubah informasi media atau upload media baru"
              : "Masukkan informasi media yang akan ditambahkan"}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor={`${idPrefix}nama`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nama Media
            </label>
            <input
              id={`${idPrefix}nama`}
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className={fieldInputClass}
              placeholder={isEdit ? undefined : "Nama media"}
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}tipe`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipe Media
            </label>
            <select
              id={`${idPrefix}tipe`}
              value={formData.tipe}
              onChange={(e) =>
                setFormData({ ...formData, tipe: e.target.value })
              }
              className={fieldInputClass}
            >
              <option value="foto">Foto</option>
              <option value="video">Video</option>
              <option value="dokumen">Dokumen</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}deskripsi`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deskripsi
            </label>
            <textarea
              id={`${idPrefix}deskripsi`}
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              className={fieldInputClass}
              placeholder={isEdit ? undefined : "Deskripsi media"}
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}upload-file`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {isEdit ? "Upload Media Baru (Opsional)" : "Upload Media"}
            </label>
            <input
              id={`${idPrefix}upload-file`}
              type="file"
              accept={getAccept(formData.tipe)}
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files?.[0] ?? null })
              }
              className={fileInputClass(isEdit)}
            />
            {isEdit ? (
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan jika tidak ingin mengubah file.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                {getFileHint(formData.tipe)}
              </p>
            )}
          </div>

          {formData.tipe === "video" && (
            <div>
              <label
                htmlFor={`${idPrefix}upload-thumbnail`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Upload Thumbnail Video (Opsional)
              </label>
              <input
                id={`${idPrefix}upload-thumbnail`}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thumbnail: e.target.files?.[0] ?? null,
                  })
                }
                className={fileInputClass(isEdit)}
              />
              <p className="text-xs text-gray-500 mt-1">
                {isEdit
                  ? "Kosongkan jika tidak ingin mengubah thumbnail."
                  : "Format yang didukung: JPG, JPEG, PNG, GIF, WEBP"}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                <span className="font-medium">Catatan:</span>{" "}
                {isEdit
                  ? "Jika tidak diisi dan video diubah, sistem akan otomatis mengambil frame pertama dari video sebagai thumbnail."
                  : "Jika tidak diisi, sistem akan otomatis mengambil frame pertama dari video sebagai thumbnail."}
              </p>
              {isEdit && currentItem?.thumbnail && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">Thumbnail saat ini:</p>
                  <div className="mt-1 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={
                        adminMediaUtils.getMediaUrl(currentItem.thumbnail) ||
                        "/placeholder.svg"
                      }
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "/placeholder.svg?height=96&width=96";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            {isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
