import { useState } from "react";
import {
  FaCheck,
  FaClock,
  FaDownload,
  FaEye,
  FaPrint,
  FaSpinner,
  FaStamp,
  FaSyncAlt,
} from "react-icons/fa";

import {
  AdminDetailGrid,
  AdminDetailItem,
  AdminField,
  AdminFilterTabs,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminMetricCard,
  AdminPageHeader,
  AdminStatusBadge,
  AdminTableShell,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import LogCetakDetailView from "@/components/admin/LogCetakDetailView";
import { type LogCetakSurat } from "@/lib/api/schemas";
import { adminLogCetakApi } from "@/lib/api/admin";
import { getErrorMessage } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { useAsyncData, useDisclosure } from "@/hooks";
import { toast } from "@/lib/toast";

const statusOptions = ["semua", "dicetak", "diresmikan"];

const thClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";
const tdClass = "px-4 py-3.5 text-sm text-on-surface-variant";
const iconButtonClass =
  "rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60";

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
    <div className="min-h-screen bg-surface">
      <div className="w-full space-y-6">
        {resmikanModal.isOpen ? (
          <AdminFormView
            eyebrow="Log Cetak Surat"
            title="Resmikan Surat"
            description="Berikan nomor surat resmi untuk surat yang telah dicetak."
            onBack={resmikanModal.close}
          >
            <AdminFormSection
              number={1}
              title="Detail Surat"
              description="Periksa data surat sebelum menetapkan nomor."
            >
              <AdminDetailGrid>
                <AdminDetailItem label="Pemohon">
                  {currentItem?.nama_pemohon || "-"}
                </AdminDetailItem>
                <AdminDetailItem label="NIK">
                  {currentItem?.nik_pemohon || "-"}
                </AdminDetailItem>
                <AdminDetailItem label="Kode Unik">
                  {currentItem?.kode_unik || "-"}
                </AdminDetailItem>
                <AdminDetailItem label="Layanan">
                  {currentItem?.nama_layanan || "-"}
                </AdminDetailItem>
                <AdminDetailItem label="Template">
                  {currentItem?.nama_template || "-"}
                </AdminDetailItem>
                <AdminDetailItem label="Tanggal Cetak">
                  {formatDateTime(currentItem?.created_at)}
                </AdminDetailItem>
              </AdminDetailGrid>
            </AdminFormSection>

            <AdminFormSection
              number={2}
              title="Nomor Surat"
              description="Nomor surat yang akan ditetapkan pada arsip ini."
            >
              <AdminField
                label="Nomor Surat"
                htmlFor="nomor_surat"
                required
                hint="Contoh: 470/001/SK/2026"
              >
                <AdminInput
                  id="nomor_surat"
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  placeholder="Contoh: 470/001/SK/2026"
                />
              </AdminField>
            </AdminFormSection>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void submitResmikan()}
                disabled={isActionLoading}
                className={adminPrimaryButtonClass}
              >
                {isActionLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCheck />
                )}
                Resmikan
              </button>
            </div>
          </AdminFormView>
        ) : previewModal.isOpen && previewItem ? (
          <LogCetakDetailView item={previewItem} onBack={previewModal.close} />
        ) : (
          <>
            <AdminPageHeader
              eyebrow="Log Cetak Surat"
              title="Log Cetak Surat"
              description="Kelola surat yang diajukan warga: unduh PDF dan resmikan dengan nomor surat."
              actions={
                <button
                  type="button"
                  onClick={() => void fetchLogData()}
                  className={adminSecondaryButtonClass}
                >
                  <FaSyncAlt />
                  Muat Ulang
                </button>
              }
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AdminMetricCard
                label="Total Cetak"
                value={logs.length}
                icon={<FaPrint />}
                tone="primary"
                hint="Jumlah surat yang dicetak"
              />
              <AdminMetricCard
                label="Dicetak"
                value={countDicetak}
                icon={<FaClock />}
                tone="info"
                hint="Menunggu nomor surat (belum resmi)"
              />
              <AdminMetricCard
                label="Diresmikan"
                value={countDiresmikan}
                icon={<FaStamp />}
                tone="neutral"
                hint="Sudah memiliki nomor surat"
              />
            </div>

            <div className="rounded-3xl border border-border bg-surface-container-lowest p-4 shadow-sm sm:p-5">
              <AdminFilterTabs
                tabs={statusOptions.map((status) => ({
                  value: status,
                  label: status.charAt(0).toUpperCase() + status.slice(1),
                }))}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <AdminTableShell
              loading={isLoading}
              error={error}
              onRetry={() => void fetchLogData()}
              empty={filteredData.length === 0}
              emptyLabel="Tidak ada data log cetak surat."
            >
              <div className="border-b border-border px-5 py-5">
                <h2 className="text-base font-semibold text-on-surface">
                  Riwayat Cetak Surat
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Kelola surat yang diajukan warga: unduh PDF dan resmikan
                  dengan nomor surat
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className={thClass}>No</th>
                      <th className={thClass}>Kode Unik</th>
                      <th className={thClass}>Pemohon</th>
                      <th className={thClass}>Layanan</th>
                      <th className={thClass}>Template</th>
                      <th className={thClass}>Nomor Surat</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Tanggal</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredData.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-surface-container-low/60"
                      >
                        <td className={tdClass}>{idx + 1}</td>
                        <td className={tdClass}>
                          <span className="rounded-lg bg-secondary-container px-2 py-1 font-mono text-xs font-medium text-on-secondary-container">
                            {item.kode_unik}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <div className="font-medium text-on-surface">
                            {item.nama_pemohon}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            NIK: {item.nik_pemohon || "-"}
                          </div>
                        </td>
                        <td className={tdClass}>
                          {item.nama_layanan || `ID ${item.id_pelayanan || "-"}`}
                        </td>
                        <td className={tdClass}>{item.nama_template || "-"}</td>
                        <td className={tdClass}>
                          {item.nomor_surat || (
                            <span className="text-muted-foreground">
                              Belum ada
                            </span>
                          )}
                        </td>
                        <td className={tdClass}>
                          <AdminStatusBadge
                            label={
                              item.status === "diresmikan"
                                ? "Diresmikan"
                                : "Dicetak"
                            }
                            tone={
                              item.status === "diresmikan" ? "primary" : "info"
                            }
                          />
                        </td>
                        <td className={tdClass}>
                          {formatDateTime(item.created_at)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handlePreview(item)}
                              className={iconButtonClass}
                              title="Lihat Surat"
                              aria-label={`Lihat surat ${item.kode_unik}`}
                            >
                              <FaEye className="text-primary" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDownload(item.id, item.kode_unik)
                              }
                              className={iconButtonClass}
                              title="Unduh PDF"
                              aria-label={`Unduh surat ${item.kode_unik}`}
                              disabled={isActionLoading}
                            >
                              <FaDownload className="text-primary" />
                            </button>
                            {item.status !== "diresmikan" && (
                              <button
                                type="button"
                                onClick={() => handleResmikan(item.id)}
                                className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
                                title="Resmikan dengan nomor surat"
                                aria-label={`Resmikan surat ${item.kode_unik}`}
                              >
                                <FaStamp />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminTableShell>
          </>
        )}
      </div>
    </div>
  );
};

export default LogCetakAdmin;
