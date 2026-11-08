import { useState, useEffect } from "react";
import {
  FaTimes,
  FaSpinner,
  FaExclamationTriangle,
  FaDownload,
  FaCheckCircle,
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

  // Ambil field template
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

  // 1. Reset state & Triger fetch data field saat Modal dibuka untuk layanan tertentu
  useEffect(() => {
    if (isOpen && pelayanan?.id) {
      setSubmitting(false);
      setSubmitError(null);
      setResult(null);
      setValues({}); // Kosongkan inputan
      void fetchFields(); // Ambil field dinamis dari API
    }
  }, [isOpen, pelayanan?.id]);

  // 2. Siapkan state form (values) begitu data fields selesai di-fetch
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

    // Validasi field dinamis
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
    <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-['poppins']">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Buatkan Surat (Admin)
            </h3>
            <p className="text-sm text-gray-500">
              Layanan: {pelayanan.nama_layanan}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {fieldsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
              <p className="text-gray-500">Memuat formulir...</p>
            </div>
          ) : fieldsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FaExclamationTriangle className="text-4xl text-yellow-500 mb-2" />
              <p className="text-gray-600">{fieldsError}</p>
            </div>
          ) : result ? (
            <div className="text-center py-4">
              <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Surat Berhasil Dibuat
              </h2>

              <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Kode Unik Surat
                </p>
                <p className="text-2xl font-mono font-bold text-blue-600 tracking-widest">
                  {result.kode_unik}
                </p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <img
                    src={qrUrl}
                    alt="QR verifikasi surat"
                    className="w-32 h-32"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <FaDownload /> Unduh PDF
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form
              id="buat-surat-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap Pemohon <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nama"
                    type="text"
                    value={values.nama || ""}
                    onChange={handleChange}
                    required
                    placeholder="Sesuai KTP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK Pemohon <span className="text-red-500">*</span>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* LOOPING UNTUK MERENDER FIELD DINAMIS (Keperluan, Tempat Lahir, dll) */}
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.tipe === "textarea" ? "md:col-span-2" : ""}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} <span className="text-red-500">*</span>
                    </label>
                    {field.tipe === "select" ? (
                      <select
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                        name={field.key}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        name={field.key}
                        type={field.tipe}
                        value={values[field.key] || ""}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {submitError}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Modal */}
        {!result && (
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              form="buat-surat-form"
              disabled={submitting || fieldsLoading || !!fieldsError}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <FaFileSignature /> Cetak Surat
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
