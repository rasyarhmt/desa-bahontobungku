import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaFileImage,
  FaFileVideo,
  FaImage,
  FaInfoCircle,
  FaTimes,
  FaVideo,
} from "react-icons/fa";

import { adminMediaUtils } from "@/lib/api/admin";

import ModalPortal from "./ModalPortal";
import type { MediaFormState, MediaItem } from "./mediaShared";

interface MediaFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: MediaFormState;
  setFormData: Dispatch<SetStateAction<MediaFormState>>;
  onSubmit: () => void;
  onCancel: () => void;
  currentItem: MediaItem | null;
  isLoading?: boolean;
}

const MEDIA_TYPES = [
  { value: "foto", label: "Foto", hint: "JPG, JPEG, PNG, GIF, WEBP", icon: FaImage },
  { value: "video", label: "Video", hint: "MP4, MKV, WEBM, OGG", icon: FaVideo },
  { value: "dokumen", label: "Dokumen", hint: "PDF", icon: FaFileAlt },
] as const;

const fieldClass =
  "w-full rounded-xl border border-border bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const getAccept = (tipe: string) => {
  if (tipe === "foto") return "image/jpeg,image/png,image/gif,image/webp";
  if (tipe === "video") return "video/mp4,video/mkv,video/webm,video/ogg";
  return "application/pdf";
};

const getFileHint = (tipe: string) => {
  const selected = MEDIA_TYPES.find((option) => option.value === tipe);
  return selected ? `Format didukung: ${selected.hint}` : "Pilih tipe media terlebih dahulu.";
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function MediaFormModal({
  isOpen,
  isEdit,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  currentItem,
  isLoading = false,
}: MediaFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const idPrefix = isEdit ? "edit-" : "";

  useEffect(() => {
    if (isOpen && !formData.file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (isOpen && !formData.thumbnail && thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }, [isOpen, formData.file, formData.thumbnail]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) setFormData((previous) => ({ ...previous, file }));
  };

  const removeFile = () => {
    setFormData((previous) => ({ ...previous, file: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeThumbnail = () => {
    setFormData((previous) => ({ ...previous, thumbnail: null }));
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const currentThumbnailUrl =
    isEdit && currentItem?.thumbnail
      ? adminMediaUtils.getMediaUrl(currentItem.thumbnail)
      : null;

  return (
    <ModalPortal>
      <div
        aria-hidden="true"
        onClick={isLoading ? undefined : onCancel}
        className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-form-title"
        className="fixed left-1/2 top-1/2 z-[80] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Form Media Terpadu
              </p>
              <span className="rounded-full bg-secondary-container px-2 py-0.5 text-[11px] font-medium text-on-secondary-container">
                {isEdit ? "Edit" : "Tambah"}
              </span>
            </div>
            <h2 id="media-form-title" className="text-xl font-semibold text-on-surface">
              {isEdit ? "Perbarui Media" : "Tambah Media Baru"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? "Ubah informasi media atau unggah berkas pengganti."
                : "Lengkapi detail media sebelum menyimpannya."}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Tutup"
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="scrollbar-hide flex-1 space-y-7 overflow-y-auto px-6 py-6">
            <section>
              <p className="mb-3 text-sm font-semibold text-on-surface">
                1. Berkas Media
              </p>
              <label
                htmlFor={`${idPrefix}file`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary-fixed/40"
                    : "border-border bg-surface-container-low hover:border-primary/50 hover:bg-surface-container"
                }`}
              >
                <input
                  ref={fileInputRef}
                  id={`${idPrefix}file`}
                  type="file"
                  accept={getAccept(formData.tipe)}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      file: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="sr-only"
                />
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-on-primary-fixed">
                  <FaCloudUploadAlt className="text-xl" />
                </span>
                <span className="text-sm font-medium text-on-surface">
                  Klik untuk memilih atau seret file ke sini
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {getFileHint(formData.tipe)}
                  {isEdit ? " · Kosongkan jika tidak mengganti berkas" : ""}
                </span>
              </label>

              {formData.file && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container">
                    <FaFileImage />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-on-surface">
                      {formData.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatBytes(formData.file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Hapus berkas terpilih"
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </section>

            <section>
              <p className="mb-3 text-sm font-semibold text-on-surface">
                2. Tipe Media
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MEDIA_TYPES.map((option) => {
                  const Icon = option.icon;
                  const isSelected = formData.tipe === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((previous) => ({
                          ...previous,
                          tipe: option.value,
                          file: null,
                          thumbnail: null,
                        }))
                      }
                      className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-primary bg-primary-fixed text-on-primary-fixed"
                          : "border-border bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <Icon className="text-lg" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-sm font-semibold text-on-surface">
                3. Informasi Media
              </p>

              <div>
                <label
                  htmlFor={`${idPrefix}nama`}
                  className="mb-1.5 block text-sm font-medium text-on-surface-variant"
                >
                  Nama / Judul Media
                </label>
                <input
                  id={`${idPrefix}nama`}
                  type="text"
                  value={formData.nama}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      nama: event.target.value,
                    }))
                  }
                  className={fieldClass}
                  placeholder="Contoh: Foto kegiatan desa"
                />
              </div>

              <div>
                <label
                  htmlFor={`${idPrefix}deskripsi`}
                  className="mb-1.5 block text-sm font-medium text-on-surface-variant"
                >
                  Deskripsi
                </label>
                <textarea
                  id={`${idPrefix}deskripsi`}
                  value={formData.deskripsi}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      deskripsi: event.target.value,
                    }))
                  }
                  className={`${fieldClass} min-h-[110px] resize-y`}
                  placeholder="Jelaskan isi media secara singkat"
                  rows={4}
                />
              </div>
            </section>

            {formData.tipe === "video" && (
              <section>
                <p className="mb-3 text-sm font-semibold text-on-surface">
                  4. Thumbnail Video
                </p>
                <label
                  htmlFor={`${idPrefix}thumbnail`}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-surface-container-low px-4 py-3 transition-colors hover:bg-surface-container"
                >
                  <input
                    ref={thumbnailInputRef}
                    id={`${idPrefix}thumbnail`}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        thumbnail: event.target.files?.[0] ?? null,
                      }))
                    }
                    className="sr-only"
                  />
                  <FaFileVideo className="text-lg text-primary" />
                  <span className="text-sm font-medium text-on-surface">
                    Pilih gambar thumbnail
                  </span>
                </label>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <FaInfoCircle className="mt-0.5 shrink-0" />
                  Jika kosong, sistem akan mengambil frame pertama dari video.
                </p>

                {formData.thumbnail && (
                  <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-on-surface">
                      {formData.thumbnail.name}
                    </span>
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      aria-label="Hapus thumbnail terpilih"
                      className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}

                {currentThumbnailUrl && (
                  <div className="mt-3">
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Thumbnail saat ini
                    </p>
                    <img
                      src={currentThumbnailUrl}
                      alt="Thumbnail video saat ini"
                      className="h-24 w-40 rounded-xl object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </section>
            )}
          </div>

          <footer className="shrink-0 border-t border-border bg-surface-container-lowest px-6 py-4">
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <FaCloudUploadAlt className="animate-pulse" />}
                {isEdit ? "Simpan Perubahan" : "Simpan Media"}
              </button>
            </div>
          </footer>
        </form>
      </aside>
    </ModalPortal>
  );
}
