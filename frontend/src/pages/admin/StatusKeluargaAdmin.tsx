import { useState } from "react";
import {
  Ban,
  Check,
  LoaderCircle,
  Lock,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
  UsersRound,
} from "lucide-react";
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
    <div className="w-full text-slate-900">
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
            <Tags aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Manajemen Status Keluarga
          </h1>
        </div>

        {isFormView ? (
          <FormView
            icon={<Tags aria-hidden="true" className="size-5 text-[#0b6393]" />}
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
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Contoh: Kepala Keluarga, Istri, Anak"
                />
                <p className="mt-1 text-sm text-slate-600">
                  Huruf besar-kecil tidak berpengaruh, spasi berlebih akan
                  dirapikan
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setIsFormView(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={save}
                disabled={isActionLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a] disabled:opacity-60"
              >
                {isActionLoading && (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-5 animate-spin"
                  />
                )}
                Simpan
              </button>
            </div>
          </FormView>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Total Status
                  </h3>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
                    <Tags aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {list.length}
                </div>
                <p className="text-base text-slate-600">Pilihan tersedia</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Aktif
                  </h3>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Check aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {countAktif}
                </div>
                <p className="text-base text-slate-600">
                  Muncul di form penduduk
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nonaktif
                  </h3>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Ban aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {countNonaktif}
                </div>
                <p className="text-base text-slate-600">
                  Disembunyikan dari form
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Dipakai
                  </h3>
                  <div className="flex size-11 items-center justify-center rounded-xl bg-sky-50 text-[#0b6393]">
                    <UsersRound aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="mb-1 text-3xl font-bold text-slate-900">
                  {totalDipakai}
                </div>
                <p className="text-base text-slate-600">Penduduk terdata</p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "semua", label: "Semua", icon: Tags, color: "teal" },
                    {
                      key: "aktif",
                      label: "Aktif",
                      icon: Check,
                      color: "green",
                    },
                    {
                      key: "nonaktif",
                      label: "Nonaktif",
                      icon: Ban,
                      color: "gray",
                    },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const on = activeTab === tab.key;
                  const onCls =
                    tab.color === "green"
                      ? "bg-emerald-700"
                      : tab.color === "gray"
                        ? "bg-slate-700"
                        : "bg-[#0b6393]";
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        on
                          ? `${onCls} text-white shadow-sm`
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`size-5 ${on ? "text-white" : "text-slate-600"}`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Daftar Status
                  </h2>
                  <p className="text-base text-slate-600">
                    Status nonaktif tidak muncul di form tambah penduduk, tetapi
                    data lama tetap tersimpan
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label
                      htmlFor="cari-status"
                      className="mb-1 block text-sm font-semibold text-slate-700"
                    >
                      Cari Status
                    </label>
                    <div className="relative">
                      <Search
                        aria-hidden="true"
                        className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        id="cari-status"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari status..."
                        className="min-h-11 w-full rounded-xl border border-slate-300 py-2 pl-11 pr-4 text-base text-slate-900 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                      />
                    </div>
                  </div>
                  <button
                    onClick={openAdd}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
                  >
                    <Plus aria-hidden="true" className="size-5" />
                    <span>Tambah Status</span>
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <LoaderCircle
                    aria-hidden="true"
                    className="mx-auto mb-4 size-5 animate-spin text-[#0b6393]"
                  />
                  <p className="text-base text-slate-600">
                    Memuat data status...
                  </p>
                </div>
              ) : error ? (
                <div className="py-8 text-center text-base text-red-700">
                  <p>{error}</p>
                  <button
                    onClick={fetchData}
                    className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a547a]"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                          ID
                        </th>
                        <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                          Nama Status
                        </th>
                        <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                          Dipakai
                        </th>
                        <th className="whitespace-nowrap px-4 py-4 text-base font-bold text-slate-900">
                          Status
                        </th>
                        <th className="whitespace-nowrap px-4 py-4 text-right text-base font-bold text-slate-900">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filtered.length > 0 ? (
                        filtered.map((item) => {
                          const used = usage[item.id] ?? 0;
                          const reserved = isReserved(item.nama);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="whitespace-nowrap px-4 py-4 text-base text-slate-600">
                                {item.id}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-base font-semibold capitalize text-slate-900">
                                    {item.nama}
                                  </span>
                                  {reserved && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-[#0b6393]">
                                      <Lock
                                        aria-hidden="true"
                                        className="size-5"
                                      />
                                      Sistem
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-4 py-4 text-base text-slate-600">
                                {used} penduduk
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                    item.is_active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {item.is_active ? "Aktif" : "Nonaktif"}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <div className="flex flex-wrap justify-end gap-2">
                                  <button
                                    onClick={() => openEdit(item)}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                                    title={reserved ? "Status sistem" : "Edit"}
                                    aria-label={
                                      reserved ? "Status sistem" : "Edit"
                                    }
                                    disabled={isActionLoading || reserved}
                                  >
                                    <Pencil
                                      aria-hidden="true"
                                      className="size-5"
                                    />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleToggle(item)}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                                    title={
                                      reserved
                                        ? "Status sistem"
                                        : item.is_active
                                          ? "Nonaktifkan"
                                          : "Aktifkan"
                                    }
                                    aria-label={
                                      reserved
                                        ? "Status sistem"
                                        : item.is_active
                                          ? "Nonaktifkan"
                                          : "Aktifkan"
                                    }
                                    disabled={isActionLoading || reserved}
                                  >
                                    {item.is_active ? (
                                      <Ban
                                        aria-hidden="true"
                                        className="size-5"
                                      />
                                    ) : (
                                      <Check
                                        aria-hidden="true"
                                        className="size-5"
                                      />
                                    )}
                                    <span>
                                      {item.is_active
                                        ? "Nonaktifkan"
                                        : "Aktifkan"}
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => openDelete(item)}
                                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                    title={
                                      used > 0 ? "Masih dipakai" : "Hapus"
                                    }
                                    aria-label={
                                      used > 0 ? "Masih dipakai" : "Hapus"
                                    }
                                    disabled={
                                      isActionLoading || reserved || used > 0
                                    }
                                  >
                                    <Trash2
                                      aria-hidden="true"
                                      className="size-5"
                                    />
                                    <span>Hapus</span>
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
                            className="px-4 py-8 text-center text-base text-slate-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Hapus
              </h3>
              <p className="text-base text-slate-600">
                Apakah Anda yakin ingin menghapus status "
                {current?.nama}"? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={deleteModal.close}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isActionLoading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
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
