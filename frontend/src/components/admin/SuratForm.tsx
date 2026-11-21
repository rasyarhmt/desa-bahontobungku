import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { Check, X } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="jenis"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          Jenis Surat
        </label>
        <select
          id="jenis"
          value={formData.jenis}
          onChange={(e) =>
            setFormData({
              ...formData,
              jenis: e.target.value as "Surat Masuk" | "Surat Keluar",
            })
          }
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
          disabled={isEdit && currentItem?.id != null && currentItem.id > 0}
        >
          <option value="Surat Masuk">Surat Masuk</option>
          <option value="Surat Keluar">Surat Keluar</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="nomor"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          Nomor Surat
        </label>
        <input
          id="nomor"
          type="text"
          value={formData.nomor}
          onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
          className={`min-h-11 w-full rounded-xl border bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0b6393]/20 ${
            formErrors.nomor
              ? "border-red-700 focus:border-red-700"
              : "border-slate-300 focus:border-[#0b6393]"
          }`}
          placeholder="Contoh: SM/2024/001"
        />
        {formErrors.nomor && (
          <p className="mt-2 text-sm font-medium text-red-700">
            {formErrors.nomor}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="perihal"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          Perihal
        </label>
        <input
          id="perihal"
          type="text"
          value={formData.perihal}
          onChange={(e) =>
            setFormData({ ...formData, perihal: e.target.value })
          }
          className={`min-h-11 w-full rounded-xl border bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0b6393]/20 ${
            formErrors.perihal
              ? "border-red-700 focus:border-red-700"
              : "border-slate-300 focus:border-[#0b6393]"
          }`}
          placeholder="Perihal surat"
        />
        {formErrors.perihal && (
          <p className="mt-2 text-sm font-medium text-red-700">
            {formErrors.perihal}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="pengirim"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          {formData.jenis === "Surat Masuk" ? "Pengirim" : "Penerima"}
        </label>
        <input
          id="pengirim"
          type="text"
          value={formData.pengirim}
          onChange={(e) =>
            setFormData({ ...formData, pengirim: e.target.value })
          }
          className={`min-h-11 w-full rounded-xl border bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-[#0b6393]/20 ${
            formErrors.pengirim
              ? "border-red-700 focus:border-red-700"
              : "border-slate-300 focus:border-[#0b6393]"
          }`}
          placeholder={
            formData.jenis === "Surat Masuk" ? "Nama pengirim" : "Nama penerima"
          }
        />
        {formErrors.pengirim && (
          <p className="mt-2 text-sm font-medium text-red-700">
            {formErrors.pengirim}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="tanggal"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          {formData.jenis === "Surat Masuk"
            ? "Tanggal Terima"
            : "Tanggal Kirim"}
        </label>
        <input
          id="tanggal"
          type="date"
          value={formData.tanggal}
          onChange={(e) =>
            setFormData({ ...formData, tanggal: e.target.value })
          }
          className={`min-h-11 w-full rounded-xl border bg-white px-4 text-base text-slate-900 focus:ring-2 focus:ring-[#0b6393]/20 ${
            formErrors.tanggal
              ? "border-red-700 focus:border-red-700"
              : "border-slate-300 focus:border-[#0b6393]"
          }`}
        />
        {formErrors.tanggal && (
          <p className="mt-2 text-sm font-medium text-red-700">
            {formErrors.tanggal}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="upload-file"
          className="mb-2 block text-base font-semibold text-slate-900"
        >
          Upload Dokumen {isEdit ? "Baru " : ""}
        </label>
        <input
          id="upload-file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="min-h-11 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-base text-slate-900 file:mr-4 file:min-h-9 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-slate-200"
        />
        {isEdit && currentItem?.file && (
          <p className="mt-2 text-base text-slate-600">
            File saat ini:{" "}
            <a
              href={`/storage/${currentItem.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#0b6393] underline hover:text-[#0b4f75]"
            >
              Lihat Dokumen
            </a>
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
        >
          <X className="size-5" aria-hidden="true" />
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
        >
          <Check className="size-5" aria-hidden="true" />
          {isEdit ? "Simpan Perubahan" : "Simpan"}
        </button>
      </div>
    </form>
  );
}
