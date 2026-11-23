import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { FaEye, FaEyeSlash, FaSave, FaUndo } from "react-icons/fa";

import ModalPortal from "@/components/admin/ModalPortal";
import {
  AdminCard,
  AdminField,
  AdminFormSection,
  AdminInput,
  AdminPageHeader,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { adminUserApi } from "@/lib/api/admin";
import { useAsyncData, useDisclosure } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";

function ActionDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          aria-hidden="true"
          onClick={onCancel}
          className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="setting-action-title"
          className="relative z-[80] w-full max-w-md rounded-3xl border border-border bg-surface-container-lowest p-6 shadow-2xl"
        >
          <h2
            id="setting-action-title"
            className="text-lg font-semibold text-on-surface"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={adminSecondaryButtonClass}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={adminPrimaryButtonClass}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function SuccessDialog({
  isOpen,
  message,
  onClose,
}: {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div
          aria-hidden="true"
          onClick={onClose}
          className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="setting-success-title"
          className="relative z-[80] w-full max-w-md rounded-3xl border border-border bg-surface-container-lowest p-6 text-center shadow-2xl"
        >
          <h2
            id="setting-success-title"
            className="text-lg font-semibold text-on-surface"
          >
            Berhasil
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className={`${adminPrimaryButtonClass} mt-6`}
          >
            Tutup
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

const SettingAdminComp = () => {
  const {
    data: userData,
    setData: setUserData,
    isLoading: loadingUser,
    error: fetchError,
  } = useAsyncData(
    async () => {
      const res = await adminUserApi.getCurrentUser();
      return {
        nama: res?.nama || "",
        email: res?.email || "",
        password: "",
      };
    },
    { nama: "", email: "", password: "" },
    { errorMessage: "Gagal memuat data user" },
  );

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const successModal = useDisclosure();
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const resetModal = useDisclosure();
  const saveModal = useDisclosure();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (
      (!userData.nama || userData.nama.trim() === "") &&
      (!userData.password || userData.password.trim() === "")
    ) {
      setError("Isi minimal salah satu field (nama atau password)");
      return;
    }

    saveModal.open();
  };

  const confirmSave = async () => {
    setIsLoading(true);
    saveModal.close();

    try {
      const email = userData.email?.trim();
      if (!email) {
        setError("Email tidak boleh kosong");
        setIsLoading(false);
        return;
      }

      const nama = userData.nama?.trim() || "";
      const password = userData.password?.trim() || "";

      const payload: { nama?: string; password?: string } = {};

      if (nama) payload.nama = nama;
      if (password) payload.password = password;

      if (Object.keys(payload).length === 0) {
        setError("Tidak ada perubahan untuk disimpan");
        setIsLoading(false);
        return;
      }

      await adminUserApi.update(payload);

      setSuccessMessage("Pengaturan berhasil disimpan");
      successModal.open();

      setUserData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(getErrorMessage(err, "Terjadi kesalahan saat menyimpan pengaturan"));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmReset = () => {
    void (async () => {
      try {
        const res = await adminUserApi.getCurrentUser();
        if (res) {
          setUserData({
            nama: res.nama || "",
            email: res.email || "",
            password: "",
          });
        }
      } catch (_err) {
        setUserData({
          nama: "",
          email: "",
          password: "",
        });
      }

      resetModal.close();
      setError("");
    })();
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Memuat data user...
      </div>
    );
  }

  const notice: ReactNode = error || fetchError;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Akun"
        title="Pengaturan Akun"
        description="Kelola informasi akun dan kredensial login Anda."
      />

      <AdminCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AdminFormSection
            number={1}
            title="Kredensial Akun"
            description="Perubahan nama dan kata sandi akan langsung diterapkan."
          >
            {notice && (
              <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {notice}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField
                label="Nama"
                htmlFor="setting-nama"
                hint="Nama yang akan ditampilkan di dashboard"
              >
                <AdminInput
                  id="setting-nama"
                  type="text"
                  value={userData.nama}
                  onChange={(event) =>
                    setUserData({ ...userData, nama: event.target.value })
                  }
                  placeholder="Masukkan nama Anda"
                />
              </AdminField>

              <AdminField
                label="Email"
                htmlFor="setting-email"
                hint="Email yang digunakan untuk login (tidak dapat diubah)"
              >
                <AdminInput
                  id="setting-email"
                  type="email"
                  value={userData.email}
                  disabled
                  placeholder="Email Anda (tidak dapat diubah)"
                />
              </AdminField>
            </div>

            <div className="mt-4">
              <AdminField
                label="Password Baru"
                htmlFor="setting-password"
                hint="Isi hanya jika ingin mengubah password"
              >
                <div className="relative">
                  <AdminInput
                    id="setting-password"
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(event) =>
                      setUserData({ ...userData, password: event.target.value })
                    }
                    className="pr-11"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-on-surface"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </AdminField>
            </div>
          </AdminFormSection>

          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-5">
            <button
              type="button"
              onClick={resetModal.open}
              className={adminSecondaryButtonClass}
            >
              <FaUndo /> Reset Form
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={adminPrimaryButtonClass}
            >
              <FaSave /> {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </AdminCard>

      <SuccessDialog
        isOpen={successModal.isOpen}
        message={successMessage}
        onClose={() => {
          successModal.close();
          setSuccessMessage("");
        }}
      />

      <ActionDialog
        isOpen={resetModal.isOpen}
        title="Konfirmasi Reset"
        description="Apakah Anda yakin ingin mereset form? Nama akan dikembalikan ke data asli dan password akan dikosongkan."
        confirmLabel="Ya, Reset"
        onConfirm={confirmReset}
        onCancel={resetModal.close}
      />

      <ActionDialog
        isOpen={saveModal.isOpen}
        title="Konfirmasi Simpan"
        description="Apakah Anda yakin ingin menyimpan perubahan pada pengaturan akun?"
        confirmLabel="Ya, Simpan"
        onConfirm={() => void confirmSave()}
        onCancel={saveModal.close}
      />
    </div>
  );
};

export default SettingAdminComp;
