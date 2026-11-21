import type { Dispatch, SetStateAction } from "react";
import { Plus, Save } from "lucide-react";

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

const fileInputClass =
  "min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 file:mr-3 file:min-h-8 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200";

const fieldInputClass =
  "min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/30";

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onCancel}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Media" : "Tambah Media Baru"}
          </h3>
          <p className="text-base text-slate-600">
            {isEdit
              ? "Ubah informasi media atau upload media baru"
              : "Masukkan informasi media yang akan ditambahkan"}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label
              htmlFor={`${idPrefix}nama`}
              className="mb-2 block text-base font-semibold text-slate-900"
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
              className="mb-2 block text-base font-semibold text-slate-900"
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
              className="mb-2 block text-base font-semibold text-slate-900"
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
              className="mb-2 block text-base font-semibold text-slate-900"
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
              className={fileInputClass}
            />
            {isEdit ? (
              <p className="mt-1 text-sm text-slate-600">
                Kosongkan jika tidak ingin mengubah file.
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">
                {getFileHint(formData.tipe)}
              </p>
            )}
          </div>

          {formData.tipe === "video" && (
            <div>
              <label
                htmlFor={`${idPrefix}upload-thumbnail`}
                className="mb-2 block text-base font-semibold text-slate-900"
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
                className={fileInputClass}
              />
              <p className="mt-1 text-sm text-slate-600">
                {isEdit
                  ? "Kosongkan jika tidak ingin mengubah thumbnail."
                  : "Format yang didukung: JPG, JPEG, PNG, GIF, WEBP"}
              </p>
              <p className="mt-1 text-sm text-[#0b6393]">
                <span className="font-semibold">Catatan:</span>{" "}
                {isEdit
                  ? "Jika tidak diisi dan video diubah, sistem akan otomatis mengambil frame pertama dari video sebagai thumbnail."
                  : "Jika tidak diisi, sistem akan otomatis mengambil frame pertama dari video sebagai thumbnail."}
              </p>
              {isEdit && currentItem?.thumbnail && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600">Thumbnail saat ini:</p>
                  <div className="mt-1 h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={
                        adminMediaUtils.getMediaUrl(currentItem.thumbnail) ||
                        "/placeholder.svg"
                      }
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
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

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
          >
            {isEdit ? (
              <Save aria-hidden="true" className="size-5" />
            ) : (
              <Plus aria-hidden="true" className="size-5" />
            )}
            <span>{isEdit ? "Simpan Perubahan" : "Simpan"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
