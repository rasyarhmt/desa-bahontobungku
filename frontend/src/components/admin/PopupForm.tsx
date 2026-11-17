import { FaUserPlus, FaTimes, FaPlus, FaSpinner } from "react-icons/fa";
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
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string | number | null } }) => void;
  handleSubmit: (e: FormEvent) => void;
  resetForm: () => void;
  isEditing: boolean;
  kepalaKeluargaList?: KepalaKeluarga[];
  statusKeluargaList?: StatusKeluarga[];
  onAddStatusKeluarga?: (nama: string) => Promise<StatusKeluarga | null>;
}

const ADD_STATUS_VALUE = "__add_status__";

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
    if (formData.id_status_keluarga != null || statusKeluargaList.length === 0) {
      return;
    }
    const byName = statusKeluargaList.find(
      (s) => s.nama.trim().toLowerCase() === formData.status.trim().toLowerCase(),
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
    <div
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 mb-6"
      style={{ fontFamily: "poppins" }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaUserPlus className="text-blue-500" size={20} />
            </div>
            <h2 className="font-semibold text-xl text-gray-800">
              {isEditing ? "Edit Data Penduduk" : "Tambah Data Penduduk"}
            </h2>
          </div>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700"
            title="Tutup"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                type="text"
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agama
              </label>
              <select
                name="agama"
                value={formData.agama}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Hindu">Hindu</option>
                <option value="Budha">Budha</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
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
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
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
                <div className="mt-2 flex items-center gap-2">
                  <input
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
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void saveNewStatus()}
                    disabled={isSavingStatus}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-60"
                  >
                    {isSavingStatus ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPlus />
                    )}
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingStatus(false);
                      setNewStatusName("");
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="tanggalLahir"
                name="tanggalLahir"
                value={toDateInputValue(formData.tanggalLahir) || ""}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleInputChange}
                placeholder="Contoh: Palu"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. KK
              </label>
              <input
                type="text"
                name="nomor_kk"
                value={formData.nomor_kk}
                onChange={handleInputChange}
                placeholder="16 digit nomor kartu keluarga"
                maxLength={16}
                required
                disabled={!isKepalaKeluarga && !useOwnKK}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {!isKepalaKeluarga && (
                <label className="mt-1.5 flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
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
                    className="accent-blue-500 mt-0.5"
                  />
                  <span>
                    Gunakan No. KK sendiri (mis. tinggal sendiri / membentuk KK
                    baru)
                  </span>
                </label>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pekerjaan
              </label>
              <input
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleInputChange}
                placeholder="Contoh: Petani"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />
            </div>
          </div>

          {!isKepalaKeluarga && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Kepala Keluarga
              </label>
              <input
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
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              />

              {isFocused && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
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
                        className="p-2 cursor-pointer hover:bg-gray-100"
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
                    <li className="p-2 text-gray-500">
                      Tidak ada hasil ditemukan
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => resetForm()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isEditing ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopupForm;
