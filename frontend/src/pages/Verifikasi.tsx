import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FaSpinner,
  FaSearch,
  FaCheckCircle,
  FaQuestionCircle,
  FaClock,
} from "react-icons/fa";
import { pelayananApi } from "@/lib/api/pelayanan";
import type { LogCetakVerifikasi } from "@/lib/api/schemas";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";

export default function Verifikasi() {
  const [searchParams] = useSearchParams();
  const [kode, setKode] = useState(searchParams.get("kode") || "");
  const [result, setResult] = useState<LogCetakVerifikasi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async (kodeUnik: string) => {
    const k = (kodeUnik || "").trim().toUpperCase();
    if (!k) {
      setError("Kode unik wajib diisi.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await pelayananApi.verifikasiSurat(k);
      setResult(data);
    } catch (err) {
      console.error("Error verifying surat:", err);
      setError(
        getErrorMessage(err, "Terjadi kesalahan saat memverifikasi surat."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prefilled = searchParams.get("kode");
    if (prefilled) {
      setKode(prefilled.toUpperCase());
      verify(prefilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{ fontFamily: "Poppins" }}
      className="flex flex-col min-h-screen bg-gray-50/50"
    >
      <Navbar />

      <div className="flex-grow">
        {/* HERO SECTION */}
        <section className="px-4 pb-8 pt-24 md:px-8">
          <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-r from-[#6CABCA] to-[#5DE1C4] shadow-xl">
            {/* Ornamen Garis seperti di Home */}
            <div className="absolute top-0 left-0 h-1 w-full bg-white/30" />

            <div className="px-6 py-14 text-center text-white md:px-16 md:py-20 flex flex-col items-center justify-center">
              <Link
                to="/"
                className="mb-4 inline-block text-sm text-white/80 transition-colors hover:text-white hover:underline"
              >
                &larr; Kembali ke Beranda
              </Link>
              <h2 className="mb-3 text-[2rem] font-bold tracking-tight text-shadow-md md:text-[3.5rem] leading-tight">
                Verifikasi Surat
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                Pastikan keaslian surat desa melalui kode unik di sudut surat
                Anda.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT SECTION */}
        <section className="px-4 pb-16 md:px-8">
          <div className="mx-auto w-full max-w-3xl space-y-6">
            {/* Form Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verify(kode);
                }}
              >
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Kode Unik Surat
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={kode}
                    onChange={(e) => setKode(e.target.value.toUpperCase())}
                    placeholder="Contoh: XUTGMYPMDG"
                    className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 uppercase transition-all focus:border-[#6CABCA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6CABCA]/20"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#6CABCA] px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-[#5bb8a4] hover:shadow-lg disabled:opacity-60 disabled:hover:shadow-md"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : (
                      <FaSearch className="text-lg" />
                    )}
                    Verifikasi
                  </button>
                </div>
                {error && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-500">
                    {error}
                  </p>
                )}
              </form>
            </div>

            {/* Result Card */}
            {result && (
              <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all">
                <div
                  className={`flex items-center gap-4 border-b px-6 py-5 md:px-8 ${
                    result.status === "diresmikan"
                      ? "border-green-200 bg-green-50/50"
                      : "border-yellow-200 bg-yellow-50/50"
                  }`}
                >
                  {result.status === "diresmikan" ? (
                    <FaCheckCircle className="text-4xl text-green-500 drop-shadow-sm" />
                  ) : (
                    <FaClock className="text-4xl text-yellow-500 drop-shadow-sm" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Status Dokumen
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {result.status === "diresmikan"
                        ? "Surat Diresmikan"
                        : "Menunggu Resmikan"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 px-6 py-6 md:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-gray-500">Nama Pemohon</span>
                    <span className="font-semibold text-gray-800">
                      {result.nama_pemohon}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-gray-500">Nomor Surat</span>
                    <span className="font-semibold text-gray-800">
                      {result.nomor_surat || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-gray-500">Dicetak Pada</span>
                    <span className="font-semibold text-gray-800">
                      {formatDateTime(result.dicetak_pada, { month: "long" })}
                    </span>
                  </div>

                  <div className="pt-2">
                    {result.status === "diresmikan" ? (
                      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        Surat ini terverifikasi <b>asli</b> dan telah diresmikan
                        oleh perangkat desa.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                        Surat ini terdaftar namun belum diresmikan. Silakan
                        lengkapi di kantor desa.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Helper Card */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                  <FaQuestionCircle className="text-2xl text-[#6CABCA]" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-gray-800">
                    Bagaimana cara verifikasi?
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    Kode unik tercetak pada setiap surat dan terkait dengan QR
                    di pojok surat. Pindai QR atau ketik kode unik di atas untuk
                    memastikan keaslian dokumen secara digital.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
