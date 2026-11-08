import { useState } from "react";
import {
  FaTags,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaBan,
  FaSpinner,
  FaSearch,
  FaLock,
  FaUsers,
} from "react-icons/fa";
import {
  type StatusKeluarga,
  adminStatusKeluargaApi,
  adminPendudukApi,
} from "@/lib/api/admin";
import { useAsyncData, useDisclosure } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/lib/toast";
import FieldLabel from "@/components/admin/FieldLabel";
import FormView from "@/components/admin/FormView";

const isReserved = (nama: string) =>
  nama.trim().toLowerCase() === "kepala keluarga";

interface StatusKeluargaData {
  list: StatusKeluarga[];
  usage: Record<number, number>;
}

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

  const [activeTab, setActiveTab] = useState<"semua" | "aktif" | "nonaktif">(
    "semua",
  );
  const [search, setSearch] = useState("");

  const [isFormView, setIsFormView] = useState(false);
  const deleteModal = useDisclosure();
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
    deleteModal.open();
  };

  const confirmDelete = async () => {
    try {
      setIsActionLoading(true);
      await adminStatusKeluargaApi.remove(current!.id);
      await fetchData();
      deleteModal.close();
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
    <div
      className="p-6 bg-gray-50 min-h-screen"
      style={{ fontFamily: "poppins" }}
    >
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FaTags className="text-indigo-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Status Keluarga
          </h1>
        </div>

        {isFormView ? (
          <FormView
            icon={<FaTags className="text-indigo-500 text-xl" />}
            title={
              mode === "add"
                ? "Tambah Status Keluarga Baru"
                : "Edit Status Keluarga"
            }
            subtitle={
              mode === "add"
                ? "Status baru langsung tersedia di form tambah penduduk"
                : "Perubahan langsung tersimpan di data master"
            }
            onBack={() => setIsFormView(false)}
          >
            <div className="space-y-4">
              <div>
                <FieldLabel label="Nama Status" required />
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Contoh: Kepala Keluarga, Istri, Anak"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Huruf besar-kecil tidak berpengaruh, spasi berlebih akan
                  dirapikan
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsFormView(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={save}
                disabled={isActionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-60"
              >
                {isActionLoading && <FaSpinner className="animate-spin" />}
                Simpan
              </button>
            </div>
          </FormView>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Status
              </h3>
              <div className="bg-indigo-100 p-2 rounded-lg">
                <FaTags className="text-indigo-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {list.length}
            </div>
            <p className="text-sm text-gray-600">Pilihan tersedia</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Aktif</h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <FaCheck className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countAktif}
            </div>
            <p className="text-sm text-gray-600">Muncul di form penduduk</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Nonaktif</h3>
              <div className="bg-gray-100 p-2 rounded-lg">
                <FaBan className="text-gray-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {countNonaktif}
            </div>
            <p className="text-sm text-gray-600">Disembunyikan dari form</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Dipakai</h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {totalDipakai}
            </div>
            <p className="text-sm text-gray-600">Penduduk terdata</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "semua", label: "Semua", icon: FaTags, color: "indigo" },
                { key: "aktif", label: "Aktif", icon: FaCheck, color: "green" },
                {
                  key: "nonaktif",
                  label: "Nonaktif",
                  icon: FaBan,
                  color: "gray",
                },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const on = activeTab === tab.key;
              const onCls =
                tab.color === "green"
                  ? "bg-green-500"
                  : tab.color === "gray"
                    ? "bg-gray-600"
                    : "bg-indigo-500";
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    on
                      ? `${onCls} text-white font-medium shadow-sm`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className={on ? "text-white" : "text-gray-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Daftar Status
              </h2>
              <p className="text-gray-600 text-sm">
                Status nonaktif tidak muncul di form tambah penduduk, tetapi
                data lama tetap tersimpan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari status..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <FaPlus className="text-white" />
                <span>Tambah Status</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <FaSpinner className="animate-spin text-indigo-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Memuat data status...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
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
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Nama Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Dipakai
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 rounded-tr-lg">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.length > 0 ? (
                    filtered.map((item) => {
                      const used = usage[item.id] ?? 0;
                      const reserved = isReserved(item.nama);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-800 capitalize">
                                {item.nama}
                              </span>
                              {reserved && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs">
                                  <FaLock size={10} /> Sistem
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {used} penduduk
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item.is_active ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-40"
                                title={reserved ? "Status sistem" : "Edit"}
                                disabled={isActionLoading || reserved}
                              >
                                <FaEdit className="text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleToggle(item)}
                                className="p-1.5 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-40"
                                title={
                                  reserved
                                    ? "Status sistem"
                                    : item.is_active
                                      ? "Nonaktifkan"
                                      : "Aktifkan"
                                }
                                disabled={isActionLoading || reserved}
                              >
                                {item.is_active ? (
                                  <FaBan className="text-yellow-600" />
                                ) : (
                                  <FaCheck className="text-yellow-600" />
                                )}
                              </button>
                              <button
                                onClick={() => openDelete(item)}
                                className="p-1.5 bg-red-100 rounded-md hover:bg-red-200 transition-colors disabled:opacity-40"
                                title={used > 0 ? "Masih dipakai" : "Hapus"}
                                disabled={isActionLoading || reserved || used > 0}
                              >
                                <FaTrash className="text-red-600" />
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
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Tidak ada status keluarga yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menghapus status "
                {current?.nama}"? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={deleteModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isActionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusKeluargaAdmin;
