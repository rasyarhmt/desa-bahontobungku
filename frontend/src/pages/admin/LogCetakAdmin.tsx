import { useState } from "react";
import {
  Check,
  Clock,
  Download,
  Eye,
  LoaderCircle,
  Printer,
  Stamp,
} from "lucide-react";
import { type LogCetakSurat } from "@/lib/api/schemas";
import { adminLogCetakApi } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { useAsyncData, useDisclosure } from "@/hooks";
import { toast } from "@/lib/toast";
import LogCetakPreviewModal from "@/components/admin/LogCetakPreviewModal";

const statusOptions = ["semua", "dicetak", "diresmikan"];

const LogCetakAdmin = () => {
  const [activeTab, setActiveTab] = useState("semua");

  const resmikanModal = useDisclosure();
  const previewModal = useDisclosure();
  const [previewItem, setPreviewItem] = useState<LogCetakSurat | null>(null);
  const [currentItem, setCurrentItem] = useState<LogCetakSurat | null>(null);
  const [nomorSurat, setNomorSurat] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const {
    data: logs,
    isLoading,
    error,
    refetch: fetchLogData,
  } = useAsyncData<LogCetakSurat[]>(
    async () => {
      const data = await adminLogCetakApi.getAllLogCetak();
      return Array.isArray(data) ? data : [];
    },
    [],
    {
      errorMessage: "Gagal memuat data log cetak surat. Silakan coba lagi nanti.",
    },
  );

  const filteredData =
    activeTab === "semua"
      ? logs
      : logs.filter((item) => item.status === activeTab);

  const countDicetak = logs.filter((item) => item.status === "dicetak").length;
  const countDiresmikan = logs.filter(
    (item) => item.status === "diresmikan"
  ).length;

  const handleDownload = async (id: number, kodeUnik: string) => {
    try {
      setIsActionLoading(true);
      const blob = await adminLogCetakApi.downloadFile(id);
      const blobUrl = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `surat-${kodeUnik}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading surat:", err);
      toast.error("Terjadi kesalahan saat mengunduh surat.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePreview = (item: LogCetakSurat) => {
    setPreviewItem(item);
    previewModal.open();
  };

  const handleResmikan = (id: number) => {
    const item = logs.find((item) => item.id === id);
    if (item) {
      setCurrentItem(item);
      setNomorSurat(item.nomor_surat || "");
      resmikanModal.open();
    }
  };

  const submitResmikan = async () => {
    if (!nomorSurat.trim()) {
      toast.warning("Nomor surat wajib diisi!");
      return;
    }
    try {
      setIsActionLoading(true);
      await adminLogCetakApi.resmikan(currentItem!.id, nomorSurat.trim());
      await fetchLogData();
      resmikanModal.close();
      toast.success("Surat berhasil diresmikan");
    } catch (err) {
      console.error("Error resmikan surat:", err);
      toast.error(
        getErrorMessage(err, "Terjadi kesalahan saat meresmikan surat.")
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#0b6393]/10">
            <Printer
              className="size-5 text-[#0b6393]"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Log Cetak Surat
          </h1>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Total Cetak
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#0b6393]/10">
                <Printer
                  className="size-5 text-[#0b6393]"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {logs.length}
            </div>
            <p className="text-base text-slate-600">
              Jumlah surat yang dicetak
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Dicetak</h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50">
                <Clock
                  className="size-5 text-amber-700"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countDicetak}
            </div>
            <p className="text-base text-slate-600">
              Menunggu nomor surat (belum resmi)
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Diresmikan
              </h3>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50">
                <Stamp
                  className="size-5 text-emerald-700"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-slate-900">
              {countDiresmikan}
            </div>
            <p className="text-base text-slate-600">
              Sudah memiliki nomor surat
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors ${
                  activeTab === status
                    ? status === "dicetak"
                      ? "bg-amber-700 text-white shadow-sm"
                      : status === "diresmikan"
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-[#0b6393] text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status === "semua" && (
                  <Printer
                    className={`size-5 ${activeTab === status ? "" : "text-[#0b6393]"}`}
                    aria-hidden="true"
                  />
                )}
                {status === "dicetak" && (
                  <Clock
                    className={`size-5 ${activeTab === status ? "" : "text-amber-700"}`}
                    aria-hidden="true"
                  />
                )}
                {status === "diresmikan" && (
                  <Stamp
                    className={`size-5 ${activeTab === status ? "" : "text-emerald-700"}`}
                    aria-hidden="true"
                  />
                )}
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Riwayat Cetak Surat
            </h2>
            <p className="text-base text-slate-600">
              Kelola surat yang diajukan warga: unduh PDF dan resmikan dengan
              nomor surat
            </p>
          </div>

          {isLoading ? (
            <div className="py-8 text-center">
              <LoaderCircle
                className="mx-auto mb-4 size-8 animate-spin text-[#0b6393]"
                aria-hidden="true"
              />
              <p className="text-base text-slate-600">
                Memuat data log cetak...
              </p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-700">
              <p className="text-base">{error}</p>
              <button
                onClick={fetchLogData}
                className="mt-4 min-h-11 rounded-xl bg-[#0b6393] px-4 text-base font-semibold text-white transition-colors hover:bg-[#084f73]"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="rounded-tl-lg px-4 py-4 text-left text-base font-bold text-slate-900">
                      No
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Kode Unik
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Pemohon
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Layanan
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Template
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Nomor Surat
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-base font-bold text-slate-900">
                      Tanggal
                    </th>
                    <th className="rounded-tr-lg px-4 py-4 text-right text-base font-bold text-slate-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4 text-slate-600">{idx + 1}</td>
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm font-semibold text-slate-800">
                            {item.kode_unik}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-900">
                          <div className="font-semibold">
                            {item.nama_pemohon}
                          </div>
                          <div className="text-sm text-slate-600">
                            NIK: {item.nik_pemohon || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-900">
                          {item.nama_layanan || `ID ${item.id_pelayanan || "-"}`}
                        </td>
                        <td className="px-4 py-4 text-slate-900">
                          {item.nama_template || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-900">
                          {item.nomor_surat || (
                            <span className="text-slate-500">Belum ada</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              item.status === "diresmikan"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status === "diresmikan"
                              ? "Diresmikan"
                              : "Dicetak"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handlePreview(item)}
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393] transition-colors hover:bg-sky-100"
                              aria-label="Lihat Surat"
                              title="Lihat Surat"
                            >
                              <Eye className="size-5" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(item.id, item.kode_unik)
                              }
                              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-[#0b6393]/10 text-[#0b6393] transition-colors hover:bg-[#0b6393]/20 disabled:opacity-50"
                              aria-label="Unduh PDF"
                              title="Unduh PDF"
                              disabled={isActionLoading}
                            >
                              <Download className="size-5" aria-hidden="true" />
                            </button>
                            {item.status !== "diresmikan" && (
                              <button
                                onClick={() => handleResmikan(item.id)}
                                className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                                aria-label="Resmikan dengan nomor surat"
                                title="Resmikan dengan nomor surat"
                              >
                                <Stamp className="size-5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-4 text-center text-base text-slate-600"
                      >
                        Tidak ada data log cetak surat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {resmikanModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Resmikan Surat
              </h3>
              <p className="text-base text-slate-600">
                Berikan nomor surat untuk surat{" "}
                <span className="font-semibold text-slate-900">
                  {currentItem?.nama_pemohon} ({currentItem?.kode_unik})
                </span>
              </p>
            </div>

            <div className="mb-6 space-y-4">
              <div>
                <label className="mb-2 block text-base font-semibold text-slate-900">
                  Nomor Surat
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
                  placeholder="Contoh: 470/001/SK/2026"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => resmikanModal.close()}
                className="min-h-11 rounded-xl bg-slate-100 px-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={submitResmikan}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-base font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <LoaderCircle
                    className="size-5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Check className="size-5" aria-hidden="true" />
                )}
                Resmikan
              </button>
            </div>
          </div>
        </div>
      )}

      <LogCetakPreviewModal
        isOpen={previewModal.isOpen}
        item={previewItem}
        onClose={previewModal.close}
      />
    </div>
  );
};

export default LogCetakAdmin;
