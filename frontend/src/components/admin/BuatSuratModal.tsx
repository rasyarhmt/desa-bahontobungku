import { useState, useEffect } from "react";
import {
  CircleCheck,
  Download,
  FilePenLine,
  LoaderCircle,
  TriangleAlert,
  X,
} from "lucide-react";
import { pelayananApi } from "@/lib/api/pelayanan";
import { resolveFileUrl } from "@/lib/api/config";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData } from "@/hooks";
import type {
  AjukanSuratResponse,
  AjukanSuratRequest,
  Pelayanan,
  TemplateField,
} from "@/lib/api/schemas";

interface BuatSuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  pelayanan: Pelayanan | null;
}

export default function BuatSuratModal({
  isOpen,
  onClose,
  pelayanan,
}: BuatSuratModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AjukanSuratResponse | null>(null);

  const {
    data: fields,
    isLoading: fieldsLoading,
    error: fieldsError,
    refetch: fetchFields,
  } = useAsyncData<TemplateField[]>(
    async () => {
      if (!pelayanan || !pelayanan.id_surat_template) return [];
      const rawFields = await pelayananApi.getTemplateFields(pelayanan.id);
      return Array.isArray(rawFields)
        ? rawFields.filter(
            (f) => f.key !== "nama_pemohon" && f.key !== "nik_pemohon",
          )
        : [];
    },
    [],
    { errorMessage: "Gagal memuat field form surat." },
  );

  useEffect(() => {
    if (isOpen && pelayanan?.id) {
      setSubmitting(false);
      setSubmitError(null);
      setResult(null);
      setValues({});
      void fetchFields();
    }
  }, [isOpen, pelayanan?.id]);

  useEffect(() => {
    if (isOpen && fields && fields.length > 0) {
      setValues((prev) => {
        const init = { ...prev };
        fields.forEach((f) => {
          if (init[f.key] === undefined) init[f.key] = "";
        });
        return init;
      });
    }
  }, [isOpen, fields]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pelayanan) return;

    const nama = String(values.nama || "").trim();
    const nik = String(values.nik || "").trim();

    if (!nama) return setSubmitError("Nama lengkap wajib diisi.");
    if (!/^[0-9]{16}$/.test(nik))
      return setSubmitError("NIK harus 16 digit angka.");

    const missing = fields.filter((f) => !String(values[f.key] || "").trim());
    if (missing.length > 0) {
      return setSubmitError(
        `Field berikut wajib diisi: ${missing.map((f) => f.label).join(", ")}.`,
      );
    }

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const data: Record<string, string> = {};
      fields.forEach((f) => {
        data[f.key] = String(values[f.key] || "").trim();
      });

      const payload: AjukanSuratRequest = {
        nama_pemohon: nama,
        nik_pemohon: nik,
        data,
      };
      const res = await pelayananApi.ajukanSurat(pelayanan.id, payload);
      setResult(res);
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, "Gagal membuat surat. Silakan coba lagi."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !pelayanan) return null;

  const downloadUrl = result ? resolveFileUrl(result.file_url) : "";
  const qrUrl = result ? resolveFileUrl(result.qr_url) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Buatkan Surat (Admin)
            </h3>
            <p className="mt-1 text-base text-slate-600">
              Layanan: {pelayanan.nama_layanan}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 font-semibold shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            aria-label="Tutup formulir"
            title="Tutup"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {fieldsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LoaderCircle
                className="size-5 animate-spin text-[#0b6393]"
                aria-hidden="true"
              />
              <p className="mt-3 text-base text-slate-600">
                Memuat formulir...
              </p>
            </div>
          ) : fieldsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TriangleAlert
                className="size-5 text-amber-700"
                aria-hidden="true"
              />
              <p className="mt-3 text-base font-medium text-slate-700">
                {fieldsError}
              </p>
            </div>
          ) : result ? (
            <div className="py-4 text-center">
              <CircleCheck
                className="mx-auto size-5 text-emerald-700"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-2xl font-bold text-emerald-700">
                Surat Berhasil Dibuat
              </h2>

              <div className="mt-5 inline-block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Kode Unik Surat
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-[#0b6393]">
                  {result.kode_unik}
                </p>
              </div>

              <div className="mt-5 flex justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <img
                    src={qrUrl}
                    alt="QR verifikasi surat"
                    className="h-32 w-32"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
                >
                  <Download className="size-5" aria-hidden="true" />
                  Unduh PDF
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <X className="size-5" aria-hidden="true" />
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form
              id="buat-surat-form"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label
                    htmlFor="nama-pemohon"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    Nama Lengkap Pemohon{" "}
                    <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="nama-pemohon"
                    name="nama"
                    type="text"
                    value={values.nama || ""}
                    onChange={handleChange}
                    required
                    placeholder="Sesuai KTP"
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="nik-pemohon"
                    className="mb-2 block text-base font-semibold text-slate-900"
                  >
                    NIK Pemohon <span className="text-red-700">*</span>
                  </label>
                  <input
                    id="nik-pemohon"
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{16}"
                    value={values.nik || ""}
                    onChange={handleChange}
                    required
                    maxLength={16}
                    placeholder="16 digit NIK"
                    className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  />
                </div>

                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.tipe === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label
                      htmlFor={`field-${field.key}`}
                      className="mb-2 block text-base font-semibold text-slate-900"
                    >
                      {field.label} <span className="text-red-700">*</span>
                    </label>
                    {field.tipe === "select" ? (
                      <select
                        id={`field-${field.key}`}
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                      >
                        <option value="">Pilih {field.label}</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.tipe === "textarea" ? (
                      <textarea
                        id={`field-${field.key}`}
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                      />
                    ) : (
                      <input
                        id={`field-${field.key}`}
                        name={field.key}
                        type={field.tipe}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required
                        className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                      />
                    )}
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700">
                  {submitError}
                </div>
              )}
            </form>
          )}
        </div>

        {!result && (
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="size-5" aria-hidden="true" />
              Batal
            </button>
            <button
              type="submit"
              form="buat-surat-form"
              disabled={submitting || fieldsLoading || !!fieldsError}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                  Memproses...
                </>
              ) : (
                <>
                  <FilePenLine className="size-5" aria-hidden="true" />
                  Cetak Surat
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
