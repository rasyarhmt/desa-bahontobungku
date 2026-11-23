import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { FaExchangeAlt, FaImage, FaPlus, FaSpinner } from "react-icons/fa";

import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";

import type { BeritaForm } from "./beritaShared";

interface BeritaFormViewProps {
  isEdit: boolean;
  formData: BeritaForm;
  setFormData: Dispatch<SetStateAction<BeritaForm>>;
  onSubmit: () => void;
  onCancel: () => void;
  isActionLoading: boolean;
}

export default function BeritaFormView({
  isEdit,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isActionLoading,
}: BeritaFormViewProps) {
  const idPrefix = isEdit ? "edit-" : "";

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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

  const actions = (
    <>
      <button
        type="button"
        onClick={onCancel}
        disabled={isActionLoading}
        className={adminSecondaryButtonClass}
      >
        Batal
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isActionLoading}
        className={adminPrimaryButtonClass}
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
    </>
  );

  return (
    <AdminFormView
      eyebrow="Manajemen Berita"
      title={isEdit ? "Edit Berita" : "Tambah Berita Baru"}
      description={
        isEdit
          ? "Ubah informasi berita"
          : "Masukkan informasi berita yang akan ditambahkan"
      }
      onBack={onCancel}
      actions={actions}
    >
      <AdminFormSection number={1} title="Informasi Berita">
        <div className="grid gap-4">
          <AdminField label="Judul Berita" htmlFor={`${idPrefix}judul`} required>
            <AdminInput
              id={`${idPrefix}judul`}
              type="text"
              value={formData.judul}
              onChange={(event) =>
                setFormData({ ...formData, judul: event.target.value })
              }
              placeholder={isEdit ? undefined : "Masukkan judul berita"}
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField
              label="Tanggal"
              htmlFor={`${idPrefix}tanggalTerbit`}
              required
            >
              <AdminInput
                id={`${idPrefix}tanggalTerbit`}
                type="date"
                value={formData.tanggalTerbit}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    tanggalTerbit: event.target.value,
                  })
                }
              />
            </AdminField>

            <AdminField label="Penulis" htmlFor={`${idPrefix}penulis`} required>
              <AdminInput
                id={`${idPrefix}penulis`}
                type="text"
                value={formData.penulis}
                onChange={(event) =>
                  setFormData({ ...formData, penulis: event.target.value })
                }
                placeholder={isEdit ? undefined : "Nama penulis"}
              />
            </AdminField>
          </div>

          <AdminField label="Status" htmlFor={`${idPrefix}status`}>
            <AdminSelect
              id={`${idPrefix}status`}
              value={formData.status}
              onChange={(event) =>
                setFormData({ ...formData, status: event.target.value })
              }
            >
              <option value="Draft">Draft</option>
              <option value="Dipublikasi">Dipublikasi</option>
            </AdminSelect>
          </AdminField>
        </div>
      </AdminFormSection>

      <AdminFormSection
        number={2}
        title="Thumbnail Berita"
        description="Gambar yang ditampilkan sebagai thumbnail berita."
      >
        <AdminField
          label="Thumbnail Berita"
          htmlFor={`${idPrefix}${isEdit ? "thumbnail-file-input" : "foto"}`}
        >
          {isEdit ? (
            <div className="flex flex-col gap-3">
              {formData.fotoPreview ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.fotoPreview}
                    alt="Thumbnail"
                    className="h-24 w-24 rounded-2xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleChangeThumbnail}
                    className={adminSecondaryButtonClass}
                  >
                    <FaExchangeAlt />
                    <span>Ganti Thumbnail</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-surface-container text-muted-foreground">
                    <FaImage className="text-2xl" />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangeThumbnail}
                    className={adminSecondaryButtonClass}
                  >
                    <FaPlus />
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
              <AdminInput
                id={`${idPrefix}foto`}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.fotoPreview && (
                <div className="relative h-16 w-16 shrink-0">
                  <img
                    src={formData.fotoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded-xl border border-border object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Hapus thumbnail"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        foto: null,
                        fotoPreview: null,
                      })
                    }
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </AdminField>
      </AdminFormSection>

      <AdminFormSection number={3} title="Konten Berita">
        <AdminField label="Konten Berita" htmlFor={`${idPrefix}isi`} required>
          <AdminTextarea
            id={`${idPrefix}isi`}
            value={formData.isi}
            onChange={(event) =>
              setFormData({ ...formData, isi: event.target.value })
            }
            className="min-h-56"
            placeholder={isEdit ? undefined : "Isi konten berita lengkap"}
          />
        </AdminField>
      </AdminFormSection>
    </AdminFormView>
  );
}
