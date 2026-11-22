import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaDownload,
  FaExclamationTriangle,
  FaFileSignature,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";

import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import ModalPortal from "@/components/admin/ModalPortal";
import { resolveFileUrl } from "@/lib/api/config";
import { pelayananApi } from "@/lib/api/pelayanan";
import type {
  AjukanSuratRequest,
  AjukanSuratResponse,
  Pelayanan,
  TemplateField,
} from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData } from "@/hooks";

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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

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
    <ModalPortal>
      <div
        aria-hidden="true"
        onClick={submitting ? undefined : onClose}
        className="fixed inset-0 z-[70] bg-inverse-surface/50 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="buat-surat-title"
        className="fixed left-1/2 top-1/2 z-[80] flex max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-border bg-surface-container-lowest shadow-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Buatkan Surat
            </p>
            <h2
              id="buat-surat-title"
              className="mt-1 text-xl font-semibold text-on-surface"
            >
              Buatkan Surat (Admin)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Layanan: {pelayanan.nama_layanan}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <FaTimes />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-6">
          {fieldsLoading ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <FaSpinner className="animate-spin text-3xl text-primary" />
              Memuat formulir...
            </div>
          ) : fieldsError ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
              <FaExclamationTriangle className="text-3xl text-destructive" />
              <p className="text-sm text-on-surface-variant">{fieldsError}</p>
            </div>
          ) : result ? (
            <div className="py-4 text-center">
              <FaCheckCircle className="mx-auto mb-4 text-5xl text-[var(--success-fg)]" />
              <h3 className="mb-2 text-xl font-semibold text-on-surface">
                Surat Berhasil Dibuat
              </h3>

              <div className="mb-6 inline-block rounded-2xl border border-border bg-surface-container-low px-6 py-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Kode Unik Surat
                </p>
                <p className="font-mono text-2xl font-semibold tracking-widest text-primary">
                  {result.kode_unik}
                </p>
              </div>

              <div className="mb-6 flex justify-center">
                <div className="rounded-2xl border border-border bg-surface-container-lowest p-4 shadow-sm">
                  <img
                    src={qrUrl}
                    alt="QR verifikasi surat"
                    className="h-32 w-32"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={adminPrimaryButtonClass}
                >
                  <FaDownload />
                  Unduh PDF
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className={adminSecondaryButtonClass}
                >
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AdminField
                    label="Nama Lengkap Pemohon"
                    htmlFor="nama"
                    required
                  >
                    <AdminInput
                      id="nama"
                      name="nama"
                      type="text"
                      value={values.nama || ""}
                      onChange={handleChange}
                      required
                      placeholder="Sesuai KTP"
                    />
                  </AdminField>
                </div>
                <div className="sm:col-span-2">
                  <AdminField label="NIK Pemohon" htmlFor="nik" required>
                    <AdminInput
                      id="nik"
                      name="nik"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{16}"
                      value={values.nik || ""}
                      onChange={handleChange}
                      required
                      maxLength={16}
                      placeholder="16 digit NIK"
                    />
                  </AdminField>
                </div>

                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.tipe === "textarea" ? "sm:col-span-2" : ""}
                  >
                    <AdminField
                      label={field.label}
                      htmlFor={`field-${field.key}`}
                      required
                    >
                      {field.tipe === "select" ? (
                        <AdminSelect
                          id={`field-${field.key}`}
                          name={field.key}
                          value={values[field.key] || ""}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Pilih {field.label}</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </AdminSelect>
                      ) : field.tipe === "textarea" ? (
                        <AdminTextarea
                          id={`field-${field.key}`}
                          name={field.key}
                          value={values[field.key] || ""}
                          onChange={handleChange}
                          rows={3}
                          required
                        />
                      ) : (
                        <AdminInput
                          id={`field-${field.key}`}
                          name={field.key}
                          type={field.tipe}
                          value={values[field.key] || ""}
                          onChange={handleChange}
                          required
                        />
                      )}
                    </AdminField>
                  </div>
                ))}
              </div>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {submitError}
                </p>
              )}
            </form>
          )}
        </div>

        {!result && (
          <footer className="shrink-0 border-t border-border bg-surface-container-low px-6 py-4">
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className={adminSecondaryButtonClass}
              >
                Batal
              </button>
              <button
                type="submit"
                form="buat-surat-form"
                disabled={submitting || fieldsLoading || !!fieldsError}
                className={adminPrimaryButtonClass}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FaFileSignature />
                    Cetak Surat
                  </>
                )}
              </button>
            </div>
          </footer>
        )}
      </aside>
    </ModalPortal>
  );
}
