import { useState } from "react";
import {
  FaPrint,
  FaDownload,
  FaStamp,
  FaSpinner,
  FaCheck,
  FaClock,
  FaEye,
} from "react-icons/fa";
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
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaPrint className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Log Cetak Surat
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Cetak
              </h3>
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaPrint className="text-purple-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {logs.length}
            </div>
            <p className="text-sm text-gray-600">Jumlah surat yang dicetak</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Dicetak
              </h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <FaClock className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countDicetak}
            </div>
            <p className="text-sm text-gray-600">
              Menunggu nomor surat (belum resmi)
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Diresmikan
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaStamp className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countDiresmikan}
            </div>
            <p className="text-sm text-gray-600">Sudah memiliki nomor surat</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === status
                    ? "bg-purple-500 text-white font-medium shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "semua" && (
                  <FaPrint
                    className={
                      activeTab === status ? "text-white" : "text-purple-500"
                    }
                  />
                )}
                {status === "dicetak" && (
                  <FaClock
                    className={
                      activeTab === status
                        ? "text-white"
                        : "text-yellow-500"
                    }
                  />
                )}
                {status === "diresmikan" && (
                  <FaStamp
                    className={
                      activeTab === status
                        ? "text-white"
                        : "text-green-500"
                    }
                  />
                )}
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Riwayat Cetak Surat
            </h2>
            <p className="text-gray-600 text-sm">
              Kelola surat yang diajukan warga: unduh PDF dan resmikan dengan
              nomor surat
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-purple-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Memuat data log cetak...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchLogData}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 rounded-tl-lg">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Kode Unik
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Pemohon
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Layanan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Template
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Nomor Surat
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-mono font-medium">
                            {item.kode_unik}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="font-medium">{item.nama_pemohon}</div>
                          <div className="text-xs text-gray-500">
                            NIK: {item.nik_pemohon || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.nama_layanan || `ID ${item.id_pelayanan || "-"}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.nama_template || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {item.nomor_surat || (
                            <span className="text-gray-400">Belum ada</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "diresmikan"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status === "diresmikan"
                              ? "Diresmikan"
                              : "Dicetak"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handlePreview(item)}
                              className="p-1.5 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
                              title="Lihat Surat"
                            >
                              <FaEye className="text-purple-600" />
                            </button>
                            <button
                              onClick={() => handleDownload(item.id, item.kode_unik)}
                              className="p-1.5 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                              title="Unduh PDF"
                              disabled={isActionLoading}
                            >
                              <FaDownload className="text-blue-600" />
                            </button>
                            {item.status !== "diresmikan" && (
                              <button
                                onClick={() => handleResmikan(item.id)}
                                className="p-1.5 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                title="Resmikan dengan nomor surat"
                            >
                                <FaStamp className="text-green-600" />
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
                        className="px-4 py-8 text-center text-gray-500"
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

      {/* Resmikan Modal */}
      {resmikanModal.isOpen && (
        <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Resmikan Surat
              </h3>
              <p className="text-gray-600 text-sm">
                Berikan nomor surat untuk surat{" "}
                <span className="font-medium">
                  {currentItem?.nama_pemohon} ({currentItem?.kode_unik})
                </span>
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Surat
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: 470/001/SK/2026"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => resmikanModal.close()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitResmikan}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheck size={12} />
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
