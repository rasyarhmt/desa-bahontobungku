import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaFileAlt, FaSave } from "react-icons/fa";

import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminSelect,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";

import type { SuratFormData } from "./suratShared";

interface SuratFormProps {
  formData: SuratFormData;
  setFormData: (data: SuratFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
  currentItem?: { id?: number; file?: string } | null;
}

export default function SuratForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
  currentItem = null,
}: SuratFormProps) {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.nomor.trim()) {
      errors.nomor = "Nomor surat wajib diisi";
    }

    if (!formData.perihal.trim()) {
      errors.perihal = "Perihal wajib diisi";
    }

    if (!formData.pengirim.trim()) {
      errors.pengirim =
        formData.jenis === "Surat Masuk"
          ? "Pengirim wajib diisi"
          : "Penerima wajib diisi";
    }

    if (!formData.tanggal) {
      errors.tanggal =
        formData.jenis === "Surat Masuk"
          ? "Tanggal terima wajib diisi"
          : "Tanggal kirim wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, file: e.target.files?.[0] || null });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AdminFormView
        eyebrow="Arsip Surat"
        title={isEdit ? "Edit Surat" : "Tambah Surat Baru"}
        description={
          isEdit
            ? "Perbarui data surat dan berkas yang tersimpan di arsip."
            : "Lengkapi data surat untuk disimpan ke dalam arsip desa."
        }
        onBack={onCancel}
      >
        <AdminFormSection
          number={1}
          title="Informasi Surat"
          description="Jenis surat, nomor, dan pihak terkait."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Jenis Surat" htmlFor="jenis" required>
              <AdminSelect
                id="jenis"
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    jenis: e.target.value as "Surat Masuk" | "Surat Keluar",
                  })
                }
                disabled={isEdit && currentItem?.id != null && currentItem.id > 0}
              >
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
              </AdminSelect>
            </AdminField>

            <AdminField
              label="Nomor Surat"
              htmlFor="nomor"
              required
              error={formErrors.nomor}
            >
              <AdminInput
                id="nomor"
                type="text"
                value={formData.nomor}
                onChange={(e) =>
                  setFormData({ ...formData, nomor: e.target.value })
                }
                placeholder="Contoh: SM/2024/001"
              />
            </AdminField>

            <AdminField
              label="Perihal"
              htmlFor="perihal"
              required
              error={formErrors.perihal}
            >
              <AdminInput
                id="perihal"
                type="text"
                value={formData.perihal}
                onChange={(e) =>
                  setFormData({ ...formData, perihal: e.target.value })
                }
                placeholder="Perihal surat"
              />
            </AdminField>

            <AdminField
              label={
                formData.jenis === "Surat Masuk" ? "Pengirim" : "Penerima"
              }
              htmlFor="pengirim"
              required
              error={formErrors.pengirim}
            >
              <AdminInput
                id="pengirim"
                type="text"
                value={formData.pengirim}
                onChange={(e) =>
                  setFormData({ ...formData, pengirim: e.target.value })
                }
                placeholder={
                  formData.jenis === "Surat Masuk"
                    ? "Nama pengirim"
                    : "Nama penerima"
                }
              />
            </AdminField>

            <AdminField
              label={
                formData.jenis === "Surat Masuk"
                  ? "Tanggal Terima"
                  : "Tanggal Kirim"
              }
              htmlFor="tanggal"
              required
              error={formErrors.tanggal}
            >
              <AdminInput
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal: e.target.value })
                }
              />
            </AdminField>
          </div>
        </AdminFormSection>

        <AdminFormSection
          number={2}
          title="Dokumen Surat"
          description="Berkas PDF atau Word yang melengkapi arsip surat."
        >
          <AdminField
            label={`Upload Dokumen ${isEdit ? "Baru " : ""}`}
            htmlFor="upload-file"
            hint="Format yang diterima: PDF, DOC, DOCX."
          >
            <AdminInput
              id="upload-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file:mr-4 file:rounded-xl file:border-0 file:bg-primary-fixed file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-on-primary-fixed hover:file:bg-primary-fixed-dim"
            />
          </AdminField>
          {isEdit && currentItem?.file && (
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <FaFileAlt className="text-primary" />
              File saat ini:{" "}
              <a
                href={`/storage/${currentItem.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline hover:text-primary/80"
              >
                Lihat Dokumen
              </a>
            </p>
          )}
        </AdminFormSection>

        <div className="flex justify-end">
          <button type="submit" className={adminPrimaryButtonClass}>
            <FaSave />
            {isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </div>
      </AdminFormView>
    </form>
  );
}
