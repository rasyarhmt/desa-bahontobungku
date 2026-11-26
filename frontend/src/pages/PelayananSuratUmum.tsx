import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileSignature,
  Home,
  Loader2,
  QrCode,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import HomeFooter from "@/components/home/HomeFooter";
import HomeHeader from "@/components/home/HomeHeader";
import { pelayananApi } from "@/lib/api/pelayanan";
import { resolveFileUrl } from "@/lib/api/config";
import { getErrorMessage } from "@/lib/errors";
import { useAsyncData } from "@/hooks";
import { CONTAINER_CLASS, SECTION_CLASS } from "@/lib/utils";
import type {
  AjukanSuratRequest,
  AjukanSuratResponse,
  Pelayanan,
  TemplateField,
} from "@/lib/api/schemas";

interface PelayananLoadResult {
  pelayanan: Pelayanan | null;
  fields: TemplateField[];
  errorMessage: string | null;
}

export default function PelayananSuratUmum() {
  const { id } = useParams<{ id: string }>();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<AjukanSuratResponse | null>(null);

  const {
    data: loaded,
    isLoading: pageLoading,
    error,
    refetch: fetchPelayanan,
  } = useAsyncData<PelayananLoadResult>(
    async () => {
      const list = await pelayananApi.getAllPelayanan();
      const found = list.find((item) => Number(item.id) === Number(id));
      if (!found) {
        return {
          pelayanan: null,
          fields: [],
          errorMessage: "Layanan tidak ditemukan.",
        };
      }
      if (found.status !== "aktif") {
        return {
          pelayanan: null,
          fields: [],
          errorMessage: "Layanan ini sedang tidak aktif.",
        };
      }
      if (!found.id_surat_template) {
        return {
          pelayanan: null,
          fields: [],
          errorMessage:
            "Layanan ini belum tersedia secara online. Silakan hubungi kantor desa.",
        };
      }

      const rawFields = await pelayananApi.getTemplateFields(found.id);
      const normalized = Array.isArray(rawFields)
        ? rawFields.filter(
            (field) =>
              field.key !== "nama_pemohon" && field.key !== "nik_pemohon",
          )
        : [];

      if (normalized.length === 0) {
        return {
          pelayanan: found,
          fields: normalized,
          errorMessage:
            "Template surat layanan ini tidak memiliki field yang dapat diisi secara online. Silakan hubungi kantor desa.",
        };
      }
      return { pelayanan: found, fields: normalized, errorMessage: null };
    },
    { pelayanan: null, fields: [], errorMessage: null },
    {
      errorMessage:
        "Terjadi kesalahan saat memuat layanan. Silakan coba lagi nanti.",
    },
  );

  const pelayanan = loaded.pelayanan;
  const fields = loaded.fields;
  const pageError = error ?? loaded.errorMessage;

  useEffect(() => {
    if (!pelayanan) return;
    const init: Record<string, string> = {};
    fields.forEach((field) => (init[field.key] = ""));
    setValues(init);
  }, [pelayanan, fields]);

  const initialId = useRef(id);
  useEffect(() => {
    if (initialId.current === id) return;
    initialId.current = id;
    void fetchPelayanan();
  }, [id, fetchPelayanan]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pelayanan) return;

    const nama = String(values.nama || "").trim();
    const nik = String(values.nik || "").trim();

    if (!nama) {
      setSubmitError("Nama lengkap wajib diisi.");
      return;
    }
    if (!/^[0-9]{16}$/.test(nik)) {
      setSubmitError("NIK harus 16 digit angka.");
      return;
    }

    const missing = fields.filter(
      (field) => field.required && !String(values[field.key] || "").trim(),
    );
    if (missing.length > 0) {
      setSubmitError(
        `Field berikut wajib diisi: ${missing.map((field) => field.label).join(", ")}.`,
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const data: Record<string, string> = {};
      fields.forEach((field) => {
        data[field.key] = String(values[field.key] || "").trim();
      });

      const payload: AjukanSuratRequest = {
        nama_pemohon: nama,
        nik_pemohon: nik,
        data,
      };
      setResult(await pelayananApi.ajukanSurat(pelayanan.id, payload));
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Gagal membuat surat. Silakan coba lagi."));
    } finally {
      setSubmitting(false);
    }
  };

  const downloadUrl = result ? resolveFileUrl(result.file_url) : "";
  const qrUrl = result ? resolveFileUrl(result.qr_url) : "";
  const inputClass =
    "w-full rounded-xl bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="home-theme min-h-screen bg-surface font-sans text-on-surface antialiased">
      <HomeHeader />

      <main className="w-full pt-28">
        <nav
          aria-label="Breadcrumb"
          className={`flex flex-wrap items-center gap-2 pb-4 pt-8 text-xs font-semibold text-on-surface-variant md:pt-12 ${CONTAINER_CLASS}`}
        >
          <Link to="/" className="flex items-center gap-1.5 hover:text-primary">
            <Home className="size-4" />
            Beranda
          </Link>
          <ChevronRight className="size-4 text-outline" />
          <Link to="/Pelayanan" className="hover:text-primary">
            Pelayanan Mandiri
          </Link>
          <ChevronRight className="size-4 text-outline" />
          <span className="text-primary">Ajukan Surat</span>
        </nav>

        <section className={`pt-8 pb-8 md:pt-12 md:pb-12 ${CONTAINER_CLASS}`}>
          <div className="relative overflow-hidden rounded-3xl bg-surface-container-low p-8 lg:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3.5 py-1.5 text-xs font-semibold text-on-tertiary-fixed">
                <FileSignature className="size-4" />
                Formulir Pengajuan Surat
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight text-on-surface lg:text-4xl">
                {pelayanan ? pelayanan.nama_layanan : "Formulir Surat Online"}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant lg:text-base">
                Lengkapi data berikut sesuai dokumen kependudukan. Surat akan
                dibuat otomatis oleh sistem dan dapat diverifikasi dengan kode
                unik.
              </p>
              <Link
                to="/Pelayanan"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Kembali ke daftar layanan
              </Link>
            </div>
          </div>
        </section>

        <section className={`${SECTION_CLASS} ${CONTAINER_CLASS}`}>
          {pageLoading ? (
            <div className="flex justify-center rounded-2xl bg-white p-12 shadow-sm">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : pageError && !pelayanan ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
              <TriangleAlert className="mx-auto size-8 text-destructive" />
              <p className="mt-3 text-sm text-destructive">{pageError}</p>
              <Link
                to="/Pelayanan"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold text-on-primary"
              >
                Kembali
              </Link>
            </div>
          ) : result ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto size-12 text-primary" />
              <h2 className="mt-4 font-display text-2xl font-bold text-on-surface">
                Surat Berhasil Dibuat
              </h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                Simpan kode unik berikut untuk mengunduh dan memverifikasi surat.
              </p>

              <div className="mt-6 rounded-2xl bg-surface-container p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
                  Kode Unik Surat
                </p>
                <p className="mt-1 font-display text-2xl font-bold tracking-widest text-primary">
                  {result.kode_unik}
                </p>
              </div>

              {qrUrl && (
                <div className="mt-6 inline-block rounded-2xl border border-surface-container bg-white p-4">
                  <img
                    src={qrUrl}
                    alt="QR verifikasi surat"
                    className="size-32"
                  />
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
                    <QrCode className="size-4" />
                    QR Verifikasi
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={downloadUrl}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
                >
                  <Download className="size-4" />
                  Unduh Surat (PDF)
                </a>
                <Link
                  to={`/verifikasi?kode=${encodeURIComponent(result.kode_unik)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Verifikasi surat
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>

              <div className="mt-8 rounded-2xl border border-surface-container bg-surface-container-low p-5 text-left">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-on-surface">
                  <ShieldCheck className="size-4 text-primary" />
                  Langkah selanjutnya
                </h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-on-surface-variant">
                  <li>Unduh dan simpan berkas PDF surat.</li>
                  <li>Gunakan kode unik atau QR untuk mengecek status surat.</li>
                  <li>
                    Status berubah menjadi diresmikan setelah perangkat desa
                    menetapkan nomor surat.
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-white p-8 shadow-sm"
            >
              <h2 className="font-display text-xl font-bold text-on-surface">
                Formulir Pengajuan
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Lengkapi data pemohon sesuai dokumen kependudukan.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="nama"
                    type="text"
                    value={values.nama || ""}
                    onChange={handleChange}
                    required
                    placeholder="Sesuai KTP"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                    NIK <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="nik"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{16}"
                    value={values.nik || ""}
                    onChange={handleChange}
                    required
                    maxLength={16}
                    placeholder="16 digit NIK"
                    className={inputClass}
                  />
                </div>

                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.tipe === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label className="mb-1 block text-xs font-semibold text-on-surface-variant">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    {field.tipe === "select" ? (
                      <select
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required={field.required}
                        className={`${inputClass} bg-surface`}
                      >
                        <option value="">Pilih {field.label}</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.tipe === "textarea" ? (
                      <textarea
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        rows={3}
                        required={field.required}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        name={field.key}
                        type={field.tipe}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required={field.required}
                        className={inputClass}
                      />
                    )}
                  </div>
                ))}
              </div>

              {pageError && pelayanan && (
                <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {pageError}
                </p>
              )}
              {submitError && (
                <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <FileSignature className="size-5" />
                )}
                {submitting ? "Membuat Surat..." : "Buat Surat"}
              </button>
            </form>
          )}
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
