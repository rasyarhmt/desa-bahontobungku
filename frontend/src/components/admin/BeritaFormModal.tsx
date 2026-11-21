import type { Dispatch, SetStateAction } from "react";
import {
  ArrowLeftRight,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";

import type { BeritaForm } from "./beritaShared";

interface BeritaFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: BeritaForm;
  setFormData: Dispatch<SetStateAction<BeritaForm>>;
  onSubmit: () => void;
  onCancel: () => void;
  isActionLoading: boolean;
}

const fieldInputClass =
  "min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/30 file:mr-3 file:min-h-8 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200";

const BeritaFormModal = ({
  isOpen,
  isEdit,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isActionLoading,
}: BeritaFormModalProps) => {
  if (!isOpen) return null;

  const idPrefix = isEdit ? "edit-" : "";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto: file,
        fotoPreview: URL.createObjectURL(file),
        deleteFoto: false,
      }));
    }
  };

  const handleChangeThumbnail = () => {
    document.getElementById(`${idPrefix}thumbnail-file-input`)?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Berita" : "Tambah Berita Baru"}
          </h3>
          <p className="text-base text-slate-600">
            {isEdit
              ? "Ubah informasi berita"
              : "Masukkan informasi berita yang akan ditambahkan"}
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div>
            <label
              htmlFor={`${idPrefix}judul`}
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Judul Berita
            </label>
            <input
              id={`${idPrefix}judul`}
              type="text"
              value={formData.judul}
              onChange={(e) =>
                setFormData({ ...formData, judul: e.target.value })
              }
              className={fieldInputClass}
              placeholder={isEdit ? undefined : "Masukkan judul berita"}
            />
          </div>

          <div>
            <label
              htmlFor={
                isEdit
                  ? `${idPrefix}thumbnail-file-input`
                  : `${idPrefix}foto`
              }
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Thumbnail Berita
            </label>
            {isEdit ? (
              <div className="flex flex-col gap-3">
                {formData.fotoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24">
                      <img
                        src={formData.fotoPreview || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="h-24 w-24 rounded-lg bg-slate-100 object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleChangeThumbnail}
                        className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
                      >
                        <ArrowLeftRight aria-hidden="true" className="size-5" />
                        <span>Ganti Thumbnail</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100">
                      <ImageIcon
                        aria-hidden="true"
                        className="size-8 text-slate-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleChangeThumbnail}
                      className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
                    >
                      <Plus aria-hidden="true" className="size-5" />
                      <span>Tambah Thumbnail</span>
                    </button>
                  </div>
                )}

                <input
                  id={`${idPrefix}thumbnail-file-input`}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <input
                  id={`${idPrefix}foto`}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={fieldInputClass}
                />
                {formData.fotoPreview && (
                  <div className="relative h-16 w-16">
                    <img
                      src={formData.fotoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg bg-slate-100 object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Hapus thumbnail"
                      title="Hapus thumbnail"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          foto: null,
                          fotoPreview: null,
                        })
                      }
                      className="absolute -right-3 -top-3 flex size-11 items-center justify-center rounded-full bg-red-700 text-white transition-colors hover:bg-red-800"
                    >
                      <X aria-hidden="true" className="size-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${idPrefix}tanggalTerbit`}
                className="mb-2 block text-base font-semibold text-slate-900"
              >
                Tanggal
              </label>
              <input
                id={`${idPrefix}tanggalTerbit`}
                type="date"
                value={formData.tanggalTerbit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tanggalTerbit: e.target.value,
                  })
                }
                className={fieldInputClass}
              />
            </div>

            <div>
              <label
                htmlFor={`${idPrefix}penulis`}
                className="mb-2 block text-base font-semibold text-slate-900"
              >
                Penulis
              </label>
              <input
                id={`${idPrefix}penulis`}
                type="text"
                value={formData.penulis}
                onChange={(e) =>
                  setFormData({ ...formData, penulis: e.target.value })
                }
                className={fieldInputClass}
                placeholder={isEdit ? undefined : "Nama penulis"}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}status`}
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Status
            </label>
            <select
              id={`${idPrefix}status`}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className={fieldInputClass}
            >
              <option value="Draft">Draft</option>
              <option value="Dipublikasi">Dipublikasi</option>
            </select>
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}isi`}
              className="mb-2 block text-base font-semibold text-slate-900"
            >
              Konten Berita
            </label>
            <textarea
              id={`${idPrefix}isi`}
              value={formData.isi}
              onChange={(e) =>
                setFormData({ ...formData, isi: e.target.value })
              }
              className={`${fieldInputClass} min-h-[200px]`}
              placeholder={isEdit ? undefined : "Isi konten berita lengkap"}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            disabled={isActionLoading}
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#0a577f]"
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <>
                <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{isEdit ? "Simpan Perubahan" : "Simpan"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeritaFormModal;
