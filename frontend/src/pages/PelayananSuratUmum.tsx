import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FaSpinner,
  FaExclamationTriangle,
  FaDownload,
  FaCheckCircle,
  FaQrcode,
  FaFileSignature,
} from "react-icons/fa";
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
      const found = list.find((l) => Number(l.id) === Number(id));
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
            (f) => f.key !== "nama_pemohon" && f.key !== "nik_pemohon",
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
    fields.forEach((f) => (init[f.key] = ""));
    setValues(init);
  }, [pelayanan, fields]);

  const initialId = useRef(id);
  useEffect(() => {
    if (initialId.current === id) return;
    initialId.current = id;
    void fetchPelayanan();
  }, [id, fetchPelayanan]);

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

    if (!nama) {
      setSubmitError("Nama lengkap wajib diisi.");
      return;
    }
    if (!/^[0-9]{16}$/.test(nik)) {
      setSubmitError("NIK harus 16 digit angka.");
      return;
    }

    const missing = fields.filter((f) => !String(values[f.key] || "").trim());
    if (missing.length > 0) {
      setSubmitError(
        `Field berikut wajib diisi: ${missing.map((f) => f.label).join(", ")}.`,
      );
      return;
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
      console.error("Error submitting surat:", err);
      setSubmitError(
        getErrorMessage(err, "Gagal membuat surat. Silakan coba lagi."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const downloadUrl = result ? resolveFileUrl(result.file_url) : "";
  const qrUrl = result ? resolveFileUrl(result.qr_url) : "";

  return (
    <>
      <Navbar />
      <div
        className="flex flex-col bg-gray-50 items-center min-h-screen"
        style={{ fontFamily: "poppins" }}
      >
        <div className="w-full bg-gradient-to-r from-[#6CABCA] to-[#5DE1C4] py-12 md:py-16">
          <div className="w-full mx-auto px-8 md:px-18 lg:px-32">
            <Link
              to="/Pelayanan"
              className="text-white text-sm mb-2 inline-block hover:underline"
            >
              &larr; Kembali ke Daftar Layanan
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              {pelayanan ? pelayanan.nama_layanan : "Formulir Surat Online"}
            </h1>
            <p className="text-white opacity-90 mt-2">
              Isi data di bawah ini. Surat akan dibuat otomatis dan dapat Anda
              unduh, lalu diresmikan di kantor desa.
            </p>
          </div>
        </div>

        <div className="w-full max-w-7xl px-8 md:px-18 lg:px-32 py-10">
          {pageLoading ? (
            <div className="flex justify-center items-center py-12 bg-white rounded-2xl shadow">
              <FaSpinner className="animate-spin text-4xl text-[#6CABCA]" />
            </div>
          ) : pageError && !pelayanan ? (
            <div className="flex flex-col justify-center items-center py-12 bg-white rounded-2xl shadow text-center">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
              <p className="text-gray-600 mb-4 px-6">{pageError}</p>
              <Link
                to="/Pelayanan"
                className="px-4 py-2 bg-[#6CABCA] text-white rounded-lg text-sm"
              >
                Kembali
              </Link>
            </div>
          ) : pageError && pelayanan ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
              <p className="text-gray-600 mb-4">{pageError}</p>
              <Link
                to="/Pelayanan"
                className="px-4 py-2 bg-[#6CABCA] text-white rounded-lg text-sm"
              >
                Kembali ke Daftar Layanan
              </Link>
            </div>
          ) : result ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Surat Berhasil Dibuat
              </h2>
              <p className="text-gray-500 mb-6">
                Simpan kode unik berikut. Gunakan untuk mengunduh surat dan
                verifikasi keaslian.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                  Kode Unik Surat
                </p>
                <p className="text-2xl font-mono font-bold text-[#6CABCA] tracking-widest">
                  {result.kode_unik}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <div className="bg-white border rounded-xl p-4">
                  <img
                    src={qrUrl}
                    alt="QR verifikasi surat"
                    className="w-32 h-32"
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <FaQrcode /> QR Verifikasi
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={downloadUrl}
                  className="flex items-center gap-2 bg-[#6CABCA] text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition"
                >
                  <FaDownload /> Unduh Surat (PDF)
                </a>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 underline"
                >
                  Buka di tab baru
                </a>
              </div>

              <div className="mt-8 text-left bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-1">
                  Langkah selanjutnya
                </h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Unduh &amp; cetak PDF surat ini.</li>
                  <li>Datang ke kantor desa membawa surat.</li>
                  <li>
                    Perangkat desa mengisi nomor surat &amp; menandatangani.
                  </li>
                  <li>
                    Status surat berubah menjadi{" "}
                    <span className="font-semibold">diresmikan</span> — bisa
                    dicek via QR/kode unik di halaman{" "}
                    <Link to="/verifikasi" className="text-[#6CABCA] underline">
                      Verifikasi Surat
                    </Link>
                    .
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-md p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Formulir Pengajuan
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Lengkapi data pemohon sesuai dokumen kependudukan.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nama"
                    type="text"
                    value={values.nama || ""}
                    onChange={handleChange}
                    required
                    placeholder="Sesuai KTP"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CABCA]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CABCA]"
                  />
                </div>

                {fields.map((field) => {
                  const { key, label, tipe, options } = field;
                  return (
                    <div
                      key={key}
                      className={tipe === "textarea" ? "md:col-span-2" : ""}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      {tipe === "select" ? (
                        <select
                          name={key}
                          value={values[key] || ""}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CABCA] bg-white"
                        >
                          <option value="">Pilih {label}</option>
                          {options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : tipe === "textarea" ? (
                        <textarea
                          name={key}
                          value={values[key] || ""}
                          onChange={handleChange}
                          rows={3}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CABCA]"
                        />
                      ) : (
                        <input
                          name={key}
                          type={tipe}
                          value={values[key] || ""}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6CABCA]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {submitError && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {submitError}
                </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#6CABCA] text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Membuat Surat...
                    </>
                  ) : (
                    <>
                      <FaFileSignature /> Buat Surat
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Semua field wajib diisi.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
