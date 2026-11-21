import { UserPlus, X, Plus, LoaderCircle, Save } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useDisclosure } from "@/hooks";
import { toDateInputValue } from "@/lib/format";
import { toast } from "@/lib/toast";
import type { StatusKeluarga } from "@/lib/api/admin";

interface KepalaKeluarga {
  id: number;
  nama: string;
  nik: string;
  nomor_kk?: string | null;
}

interface PopupFormProps {
  formData: {
    id: number;
    nama: string;
    nik: string;
    alamat: string;
    tanggalLahir: string;
    tempatLahir: string;
    nomor_kk: string;
    jenisKelamin: string;
    agama: string;
    pekerjaan: string;
    id_kepalakeluarga: number | null;
    id_status_keluarga: number | null;
    status: string;
  };
  handleInputChange: (
    e:
      | ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string | number | null } },
  ) => void;
  handleSubmit: (e: FormEvent) => void;
  resetForm: () => void;
  isEditing: boolean;
  kepalaKeluargaList?: KepalaKeluarga[];
  statusKeluargaList?: StatusKeluarga[];
  onAddStatusKeluarga?: (nama: string) => Promise<StatusKeluarga | null>;
}

const ADD_STATUS_VALUE = "__add_status__";

const inputClass =
  "w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100";

const PopupForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  resetForm,
  isEditing,
  kepalaKeluargaList = [],
  statusKeluargaList = [],
  onAddStatusKeluarga,
}: PopupFormProps) => {
  const [searchKK, setSearchKK] = useState("");
  const { isOpen: isFocused, setOpen: setIsFocused } = useDisclosure();
  const [useOwnKK, setUseOwnKK] = useState(false);
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isKepalaKeluarga =
    formData.status.trim().toLowerCase() === "kepala keluarga";

  useEffect(() => {
    if (
      formData.id_status_keluarga != null ||
      statusKeluargaList.length === 0
    ) {
      return;
    }
    const byName = statusKeluargaList.find(
      (s) =>
        s.nama.trim().toLowerCase() === formData.status.trim().toLowerCase(),
    );
    const fallback =
      statusKeluargaList.find(
        (s) => s.nama.trim().toLowerCase() === "kepala keluarga",
      ) ?? statusKeluargaList[0];
    const selected = byName ?? fallback;
    if (selected) {
      handleInputChange({
        target: { name: "id_status_keluarga", value: selected.id },
      });
      handleInputChange({
        target: { name: "status", value: selected.nama },
      });
    }
  }, [
    statusKeluargaList,
    formData.id_status_keluarga,
    formData.status,
    handleInputChange,
  ]);

  const saveNewStatus = async () => {
    const nama = newStatusName.trim();
    if (!nama) {
      toast.warning("Nama status keluarga wajib diisi!");
      return;
    }
    if (!onAddStatusKeluarga) {
      return;
    }
    setIsSavingStatus(true);
    const created = await onAddStatusKeluarga(nama);
    setIsSavingStatus(false);
    if (created) {
      handleInputChange({
        target: { name: "id_status_keluarga", value: created.id },
      });
      handleInputChange({
        target: { name: "status", value: created.nama },
      });
      setNewStatusName("");
      setIsAddingStatus(false);
    }
  };

  useEffect(() => {
    if (isKepalaKeluarga) {
      if (formData.id_kepalakeluarga !== null) {
        handleInputChange({
          target: { name: "id_kepalakeluarga", value: null },
        });
      }
      setSearchKK("");
    } else if (formData.id_kepalakeluarga) {
      const selectedKK = kepalaKeluargaList.find(
        (kk) => Number(kk.id) === Number(formData.id_kepalakeluarga),
      );
      if (selectedKK) {
        setSearchKK(`${selectedKK.nama} (${selectedKK.nik})`);
      } else {
        setSearchKK("");
      }
    }
  }, [
    formData.status,
    formData.id_kepalakeluarga,
    kepalaKeluargaList,
    handleInputChange,
  ]);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-[#0b6393]">
              <UserPlus aria-hidden="true" className="size-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit Data Penduduk" : "Tambah Data Penduduk"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetForm}
            title="Tutup"
            aria-label="Tutup"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="nama"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Nama Lengkap
              </label>
              <input
                id="nama"
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="nik"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                NIK
              </label>
              <input
                id="nik"
                type="text"
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="agama"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Agama
              </label>
              <select
                id="agama"
                name="agama"
                value={formData.agama}
                onChange={handleInputChange}
                required
                className={inputClass}
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Hindu">Hindu</option>
                <option value="Budha">Budha</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="status-keluarga"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Status
              </label>
              <select
                id="status-keluarga"
                name="status"
                value={formData.id_status_keluarga ?? ""}
                onChange={(e) => {
                  if (e.target.value === ADD_STATUS_VALUE) {
                    setIsAddingStatus(true);
                    return;
                  }
                  const id = Number(e.target.value);
                  const selected = statusKeluargaList.find((s) => s.id === id);
                  handleInputChange({
                    target: { name: "id_status_keluarga", value: id || null },
                  });
                  handleInputChange({
                    target: { name: "status", value: selected?.nama ?? "" },
                  });
                }}
                required
                className={inputClass}
              >
                <option value="" disabled>
                  {statusKeluargaList.length === 0
                    ? "Memuat status..."
                    : "Pilih status keluarga"}
                </option>
                {statusKeluargaList.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nama}
                  </option>
                ))}
                <option value={ADD_STATUS_VALUE}>+ Tambah status baru</option>
              </select>
              {isAddingStatus && (
                <div className="mt-3 space-y-2">
                  <label
                    htmlFor="newStatusName"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Nama Status Baru
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="newStatusName"
                      type="text"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void saveNewStatus();
                        }
                      }}
                      placeholder="Nama status baru..."
                      autoFocus
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => void saveNewStatus()}
                      disabled={isSavingStatus}
                      className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084c73] disabled:opacity-60"
                    >
                      {isSavingStatus ? (
                        <LoaderCircle
                          aria-hidden="true"
                          className="size-5 animate-spin"
                        />
                      ) : (
                        <Plus aria-hidden="true" className="size-5" />
                      )}
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingStatus(false);
                        setNewStatusName("");
                      }}
                      className="min-h-11 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alamat & Pekerjaan sekarang sejajar */}
            <div>
              <label
                htmlFor="alamat"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Alamat
              </label>
              <input
                id="alamat"
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="pekerjaan"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Pekerjaan
              </label>
              <input
                id="pekerjaan"
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleInputChange}
                placeholder="Contoh: Petani"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="tanggalLahir"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="tanggalLahir"
                name="tanggalLahir"
                value={toDateInputValue(formData.tanggalLahir) || ""}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label
                htmlFor="tempatLahir"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Tempat Lahir
              </label>
              <input
                id="tempatLahir"
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleInputChange}
                placeholder="Contoh: Palu"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="nomor_kk"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                No. KK
              </label>
              <input
                id="nomor_kk"
                type="text"
                name="nomor_kk"
                value={formData.nomor_kk}
                onChange={handleInputChange}
                placeholder="16 digit nomor kartu keluarga"
                maxLength={16}
                required
                disabled={!isKepalaKeluarga && !useOwnKK}
                className={inputClass}
              />
              {!isKepalaKeluarga && (
                <label
                  htmlFor="useOwnKK"
                  className="mt-2 flex cursor-pointer items-start gap-2 text-sm text-slate-600"
                >
                  <input
                    id="useOwnKK"
                    type="checkbox"
                    checked={useOwnKK}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUseOwnKK(checked);
                      if (!checked && formData.id_kepalakeluarga) {
                        const selectedKK = kepalaKeluargaList.find(
                          (kk) =>
                            Number(kk.id) ===
                            Number(formData.id_kepalakeluarga),
                        );
                        if (selectedKK) {
                          handleInputChange({
                            target: {
                              name: "nomor_kk",
                              value: selectedKK.nomor_kk || "",
                            },
                          });
                        }
                      }
                    }}
                    className="mt-0.5 size-5 accent-[#0b6393]"
                  />
                  <span>
                    Gunakan No. KK sendiri (mis. tinggal sendiri / membentuk KK
                    baru)
                  </span>
                </label>
              )}
            </div>
            <div>
              <label
                htmlFor="jenisKelamin"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Jenis Kelamin
              </label>
              <select
                id="jenisKelamin"
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleInputChange}
                required
                className={inputClass}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>

          {!isKepalaKeluarga && (
            <div className="relative">
              <label
                htmlFor="searchKK"
                className="mb-1 block text-sm font-semibold text-slate-800"
              >
                Pilih Kepala Keluarga
              </label>
              <input
                id="searchKK"
                type="text"
                ref={inputRef}
                placeholder="Cari nama/NIK kepala keluarga..."
                value={searchKK}
                onChange={(e) => {
                  setSearchKK(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsFocused(false), 100);
                }}
                className={inputClass}
              />

              {isFocused && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {kepalaKeluargaList
                    .filter((kk) => kk.id !== formData.id)
                    .filter((kk) => {
                      const q = searchKK.toLowerCase();
                      return (
                        kk.nama.toLowerCase().includes(q) ||
                        kk.nik.toLowerCase().includes(q)
                      );
                    })
                    .map((kk) => (
                      <li
                        key={kk.id}
                        onMouseDown={() => {
                          handleInputChange({
                            target: { name: "id_kepalakeluarga", value: kk.id },
                          });
                          handleInputChange({
                            target: {
                              name: "nomor_kk",
                              value: kk.nomor_kk || "",
                            },
                          });
                          setUseOwnKK(false);
                          setSearchKK(`${kk.nama} (${kk.nik})`);
                          setIsFocused(false);
                        }}
                        className="cursor-pointer px-4 py-3 text-base hover:bg-slate-50"
                      >
                        {kk.nama} ({kk.nik})
                      </li>
                    ))}
                  {kepalaKeluargaList
                    .filter((kk) => kk.id !== formData.id)
                    .filter((kk) => {
                      const q = searchKK.toLowerCase();
                      return (
                        kk.nama.toLowerCase().includes(q) ||
                        kk.nik.toLowerCase().includes(q)
                      );
                    }).length === 0 && (
                    <li className="px-4 py-3 text-sm text-slate-600">
                      Tidak ada hasil ditemukan
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => resetForm()}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              <X aria-hidden="true" className="size-5" />
              Batal
            </button>
            <button
              type="submit"
              className="flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6393] px-4 py-2 text-sm font-semibold text-white hover:bg-[#084c73]"
            >
              <Save aria-hidden="true" className="size-5" />
              {isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
