import type { Dispatch, SetStateAction } from "react";
import { FaSpinner, FaImage, FaPlus, FaExchangeAlt } from "react-icons/fa";

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
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500";

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
    <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-modalFadeIn">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Berita" : "Tambah Berita Baru"}
          </h3>
          <p className="text-gray-600 text-sm">
            {isEdit
              ? "Ubah informasi berita"
              : "Masukkan informasi berita yang akan ditambahkan"}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor={`${idPrefix}judul`}
              className="block text-sm font-medium text-gray-700 mb-1"
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
              htmlFor={`${idPrefix}foto`}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Thumbnail Berita
            </label>
            {isEdit ? (
              <div className="flex flex-col gap-3">
                {formData.fotoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative">
                      <img
                        src={formData.fotoPreview || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handleChangeThumbnail}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <FaExchangeAlt size={14} />
                        <span>Ganti Thumbnail</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <FaImage className="text-gray-400 text-2xl" />
                    </div>
                    <button
                      type="button"
                      onClick={handleChangeThumbnail}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <FaPlus size={14} />
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
                  <div className="relative w-16 h-16">
                    <img
                      src={formData.fotoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          foto: null,
                          fotoPreview: null,
                        })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={`${idPrefix}tanggalTerbit`}
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className="block text-sm font-medium text-gray-700 mb-1"
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
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="block text-sm font-medium text-gray-700 mb-1"
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

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isActionLoading}
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <>
                <FaSpinner className="animate-spin" />
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
