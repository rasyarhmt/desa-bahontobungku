import { useState } from "react";
import {
  FaBan,
  FaCheck,
  FaEdit,
  FaPlus,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  AdminField,
  AdminFilterTabs,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminMetricCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
  AdminTableShell,
  adminPrimaryButtonClass,
} from "@/components/admin/admin-ui";
import {
  type StatusKeluarga,
  adminStatusKeluargaApi,
  adminPendudukApi,
} from "@/lib/api/admin";
import { useAsyncData } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";

const isReserved = (nama: string) =>
  nama.trim().toLowerCase() === "kepala keluarga";

interface StatusKeluargaData {
  list: StatusKeluarga[];
  usage: Record<number, number>;
}

type StatusTab = "semua" | "aktif" | "nonaktif";

const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-container-lowest text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-40";

const StatusKeluargaAdmin = () => {
  const {
    data,
    isLoading,
    error,
    refetch: fetchData,
  } = useAsyncData<StatusKeluargaData>(
    async () => {
      const [statuses, penduduks] = await Promise.all([
        adminStatusKeluargaApi.getAll(true),
        adminPendudukApi.getAllPenduduk(),
      ]);
      const counts: Record<number, number> = {};
      penduduks.forEach((p) => {
        if (p.id_status_keluarga) {
          counts[p.id_status_keluarga] =
            (counts[p.id_status_keluarga] ?? 0) + 1;
        }
      });
      return { list: statuses, usage: counts };
    },
    { list: [], usage: {} },
    {
      errorMessage:
        "Gagal memuat data status keluarga. Silakan coba lagi nanti.",
    },
  );
  const { list, usage } = data;

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>("semua");
  const [search, setSearch] = useState("");
  const [isFormView, setIsFormView] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [current, setCurrent] = useState<StatusKeluarga | null>(null);
  const [formData, setFormData] = useState({ nama: "" });

  const filtered = list.filter((s) => {
    const matchTab =
      activeTab === "semua"
        ? true
        : activeTab === "aktif"
          ? s.is_active
          : !s.is_active;
    return (
      matchTab && s.nama.toLowerCase().includes(search.trim().toLowerCase())
    );
  });

  const countAktif = list.filter((s) => s.is_active).length;
  const countNonaktif = list.length - countAktif;
  const totalDipakai = Object.values(usage).reduce((a, b) => a + b, 0);

  const openAdd = () => {
    setMode("add");
    setCurrent(null);
    setFormData({ nama: "" });
    setIsFormView(true);
  };

  const openEdit = (item: StatusKeluarga) => {
    if (isReserved(item.nama)) {
      toast.warning('Status "kepala keluarga" tidak dapat diubah.');
      return;
    }
    setMode("edit");
    setCurrent(item);
    setFormData({ nama: item.nama });
    setIsFormView(true);
  };

  const save = async () => {
    const nama = formData.nama.trim().replace(/\s+/g, " ");
    if (!nama) {
      toast.warning("Nama status keluarga wajib diisi!");
      return;
    }
    try {
      setIsActionLoading(true);
      if (mode === "add") {
        await adminStatusKeluargaApi.add(nama);
      } else {
        await adminStatusKeluargaApi.update(current!.id, nama);
      }
      await fetchData();
      setIsFormView(false);
      toast.success(
        mode === "add"
          ? "Status keluarga berhasil ditambahkan"
          : "Status keluarga berhasil diperbarui",
      );
    } catch (err) {
      console.error("Error saving status keluarga:", err);
      toast.error(
        getErrorMessage(err, "Terjadi kesalahan saat menyimpan status."),
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggle = async (item: StatusKeluarga) => {
    if (isReserved(item.nama)) {
      toast.warning('Status "kepala keluarga" tidak dapat dinonaktifkan.');
      return;
    }
    try {
      setIsActionLoading(true);
      await adminStatusKeluargaApi.toggleActive(item.id);
      await fetchData();
      toast.success("Status berhasil diubah");
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error(
        getErrorMessage(err, "Terjadi kesalahan saat mengubah status."),
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  const openDelete = (item: StatusKeluarga) => {
    if (isReserved(item.nama)) {
      toast.warning('Status "kepala keluarga" tidak dapat dihapus.');
      return;
    }
    if ((usage[item.id] ?? 0) > 0) {
      toast.warning(
        `Status ini masih dipakai ${usage[item.id]} penduduk. Nonaktifkan saja.`,
      );
      return;
    }
    setCurrent(item);
  };

  const confirmDelete = async () => {
    if (!current) return;
    try {
      setIsActionLoading(true);
      await adminStatusKeluargaApi.remove(current.id);
      await fetchData();
      setCurrent(null);
      toast.success("Status keluarga berhasil dihapus");
    } catch (err) {
      console.error("Error deleting status:", err);
      toast.error(
        getErrorMessage(err, "Terjadi kesalahan saat menghapus status."),
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isFormView ? (
        <AdminFormView
          eyebrow="Status Keluarga"
          title={
            mode === "add"
              ? "Tambah Status Keluarga Baru"
              : "Edit Status Keluarga"
          }
          description={
            mode === "add"
              ? "Status baru langsung tersedia di form tambah penduduk"
              : "Perubahan langsung tersimpan di data master"
          }
          onBack={() => setIsFormView(false)}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="space-y-8"
          >
            <AdminFormSection
              title="Nama Status"
              description="Huruf besar-kecil tidak berpengaruh, spasi berlebih akan dirapikan."
            >
              <AdminField label="Nama Status" htmlFor="status-nama" required>
                <AdminInput
                  id="status-nama"
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  placeholder="Contoh: Kepala Keluarga, Istri, Anak"
                  required
                />
              </AdminField>
            </AdminFormSection>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={isActionLoading}
                className={adminPrimaryButtonClass}
              >
                Simpan
              </button>
            </div>
          </form>
        </AdminFormView>
      ) : (
        <>
          <AdminPageHeader
            eyebrow="Data Master"
            title="Manajemen Status Keluarga"
            description="Kelola pilihan status yang tersedia di form penduduk."
            actions={
              <button type="button" onClick={openAdd} className={adminPrimaryButtonClass}>
                <FaPlus /> Tambah Status
              </button>
            }
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <AdminMetricCard label="Total Status" value={list.length} icon={<FaUsers />} tone="primary" hint="Pilihan tersedia" />
            <AdminMetricCard label="Aktif" value={countAktif} icon={<FaCheck />} tone="success" hint="Muncul di form penduduk" />
            <AdminMetricCard label="Nonaktif" value={countNonaktif} icon={<FaBan />} tone="neutral" hint="Disembunyikan dari form" />
            <AdminMetricCard label="Dipakai" value={totalDipakai} icon={<FaUsers />} tone="info" hint="Penduduk terdata" />
          </div>

          <div className="rounded-3xl border border-border bg-surface-container-lowest p-4 shadow-sm">
            <AdminFilterTabs
              tabs={[
                { value: "semua", label: "Semua" },
                { value: "aktif", label: "Aktif" },
                { value: "nonaktif", label: "Nonaktif" },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <AdminTableShell
            loading={isLoading}
            error={error}
            onRetry={() => void fetchData()}
          >
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-on-surface">
                    Daftar Status
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Status nonaktif tidak muncul di form tambah penduduk, tetapi
                    data lama tetap tersimpan
                  </p>
                </div>
                <AdminSearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Cari status..."
                  className="w-full sm:w-64"
                />
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-on-surface-variant">
                    <thead>
                      <tr className="border-b border-border bg-surface-container-low">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Nama Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Dipakai
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.length > 0 ? (
                        filtered.map((item) => {
                          const used = usage[item.id] ?? 0;
                          const reserved = isReserved(item.nama);
                          return (
                            <tr key={item.id} className="transition-colors hover:bg-surface-container-low">
                              <td className="px-4 py-3 text-muted-foreground">
                                {item.id}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium capitalize text-on-surface">
                                    {item.nama}
                                  </span>
                                  {reserved && (
                                    <AdminStatusBadge
                                      label="Sistem"
                                      tone="info"
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">{used} penduduk</td>
                              <td className="px-4 py-3">
                                <AdminStatusBadge
                                  label={item.is_active ? "Aktif" : "Nonaktif"}
                                  tone={item.is_active ? "success" : "neutral"}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    className={actionButtonClass}
                                    title={reserved ? "Status sistem" : "Edit"}
                                    disabled={isActionLoading || reserved}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleToggle(item)}
                                    className={`${actionButtonClass} hover:text-primary`}
                                    title={
                                      reserved
                                        ? "Status sistem"
                                        : item.is_active
                                          ? "Nonaktifkan"
                                          : "Aktifkan"
                                    }
                                    disabled={isActionLoading || reserved}
                                  >
                                    {item.is_active ? <FaBan /> : <FaCheck />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openDelete(item)}
                                    className={`${actionButtonClass} hover:text-destructive`}
                                    title={used > 0 ? "Masih dipakai" : "Hapus"}
                                    disabled={
                                      isActionLoading || reserved || used > 0
                                    }
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                          >
                            Tidak ada status keluarga yang ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>
          </AdminTableShell>
        </>
      )}

      <ConfirmDialog
        isOpen={current !== null}
        title="Konfirmasi Hapus"
        description={`Apakah Anda yakin ingin menghapus status "${current?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isActionLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setCurrent(null)}
      />
    </div>
  );
};

export default StatusKeluargaAdmin;
