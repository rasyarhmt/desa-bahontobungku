import { FaPlus, FaSpinner } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  AdminField,
  AdminFormSection,
  AdminFormView,
  AdminInput,
  AdminSelect,
  adminFieldClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
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

  const filteredKK = kepalaKeluargaList
    .filter((kk) => kk.id !== formData.id)
    .filter((kk) => {
      const q = searchKK.toLowerCase();
      return (
        kk.nama.toLowerCase().includes(q) || kk.nik.toLowerCase().includes(q)
      );
    });

  return (
    <AdminFormView
      eyebrow="Kependudukan"
      title={isEditing ? "Edit Data Penduduk" : "Tambah Data Penduduk"}
      description="Lengkapi data penduduk dan hubungan keluarganya."
      onBack={resetForm}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <AdminFormSection
          number={1}
          title="Data Pribadi"
          description="Identitas dan data dasar penduduk."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Nama Lengkap" htmlFor="penduduk-nama" required>
              <AdminInput
                id="penduduk-nama"
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                required
              />
            </AdminField>

            <AdminField label="NIK" htmlFor="penduduk-nik" required>
              <AdminInput
                id="penduduk-nik"
                type="text"
                name="nik"
                value={formData.nik}
                onChange={handleInputChange}
                required
              />
            </AdminField>

            <AdminField label="Agama" htmlFor="penduduk-agama" required>
              <AdminSelect
                id="penduduk-agama"
                name="agama"
                value={formData.agama}
                onChange={handleInputChange}
                required
              >
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Hindu">Hindu</option>
                <option value="Budha">Budha</option>
                <option value="Lainnya">Lainnya</option>
              </AdminSelect>
            </AdminField>

            <AdminField label="Jenis Kelamin" htmlFor="penduduk-jk" required>
              <AdminSelect
                id="penduduk-jk"
                name="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={handleInputChange}
                required
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </AdminSelect>
            </AdminField>

            <AdminField label="Alamat" htmlFor="penduduk-alamat" required>
              <AdminInput
                id="penduduk-alamat"
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                required
              />
            </AdminField>

            <AdminField label="Pekerjaan" htmlFor="penduduk-pekerjaan">
              <AdminInput
                id="penduduk-pekerjaan"
                type="text"
                name="pekerjaan"
                value={formData.pekerjaan}
                onChange={handleInputChange}
                placeholder="Contoh: Petani"
              />
            </AdminField>

            <AdminField
              label="Tanggal Lahir"
              htmlFor="penduduk-tanggal-lahir"
              required
            >
              <AdminInput
                id="penduduk-tanggal-lahir"
                type="date"
                name="tanggalLahir"
                value={toDateInputValue(formData.tanggalLahir) || ""}
                onChange={handleInputChange}
                required
              />
            </AdminField>

            <AdminField label="Tempat Lahir" htmlFor="penduduk-tempat-lahir">
              <AdminInput
                id="penduduk-tempat-lahir"
                type="text"
                name="tempatLahir"
                value={formData.tempatLahir}
                onChange={handleInputChange}
                placeholder="Contoh: Palu"
              />
            </AdminField>
          </div>
        </AdminFormSection>

        <AdminFormSection
          number={2}
          title="Status & Keluarga"
          description="Status keluarga menentukan apakah kepala keluarga perlu dipilih."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Status" htmlFor="penduduk-status" required>
              <AdminSelect
                id="penduduk-status"
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
              </AdminSelect>

              {isAddingStatus && (
                <div className="mt-2 flex items-center gap-2">
                  <AdminInput
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
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => void saveNewStatus()}
                    disabled={isSavingStatus}
                    className={adminPrimaryButtonClass}
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
                    className={adminSecondaryButtonClass}
                  >
                    Batal
                  </button>
                </div>
              )}
            </AdminField>

            <AdminField label="No. KK" htmlFor="penduduk-nomor-kk" required>
              <AdminInput
                id="penduduk-nomor-kk"
                type="text"
                name="nomor_kk"
                value={formData.nomor_kk}
                onChange={handleInputChange}
                placeholder="16 digit nomor kartu keluarga"
                maxLength={16}
                required
                disabled={!isKepalaKeluarga && !useOwnKK}
              />
              {!isKepalaKeluarga && (
                <label className="mt-1.5 flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
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
                    className="mt-0.5 accent-primary"
                  />
                  <span>
                    Gunakan No. KK sendiri (mis. tinggal sendiri / membentuk KK
                    baru)
                  </span>
                </label>
              )}
            </AdminField>
          </div>

          {!isKepalaKeluarga && (
            <div className="relative mt-4">
              <AdminField label="Pilih Kepala Keluarga" htmlFor="penduduk-kk-search">
                <input
                  id="penduduk-kk-search"
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
                  className={adminFieldClass}
                />
              </AdminField>

              {isFocused && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-container-lowest shadow-lg">
                  {filteredKK.map((kk) => (
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
                      className="cursor-pointer px-4 py-2 text-sm text-on-surface transition-colors hover:bg-surface-container"
                    >
                      {kk.nama} ({kk.nik})
                    </li>
                  ))}
                  {filteredKK.length === 0 && (
                    <li className="px-4 py-2 text-sm text-muted-foreground">
                      Tidak ada hasil ditemukan
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </AdminFormSection>

        <div className="flex justify-end gap-2">
          <button type="submit" className={adminPrimaryButtonClass}>
            {isEditing ? "Update" : "Simpan"}
          </button>
        </div>
      </form>
    </AdminFormView>
  );
};

export default PopupForm;
