import { useState } from "react";
import type { FormEvent } from "react";
import {
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  RotateCcw,
  Save,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { adminUserApi } from "@/lib/api/admin";
import { useAsyncData, useDisclosure } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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

  const handleReset = () => {
    resetModal.open();
  };

  const confirmReset = async () => {
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
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="flex flex-col items-center gap-3 text-center">
          <LoaderCircle
            className="size-5 animate-spin text-[#0b6393]"
            aria-hidden="true"
          />
          <p className="text-base text-slate-600">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6">
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-3">
            <Settings
              className="size-5 text-[#0b6393]"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Akun</h1>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Kredensial Akun
            </h2>
            <p className="mt-1 text-base text-slate-600">
              Kelola informasi akun dan kredensial login Anda
            </p>
          </div>

          {(error || fetchError) && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-base text-red-700">
              {error || fetchError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="nama"
                className="mb-2 block text-base font-semibold text-slate-900"
              >
                Nama
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="nama"
                  type="text"
                  value={userData.nama}
                  onChange={(e) =>
                    setUserData({ ...userData, nama: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Nama yang akan ditampilkan di dashboard
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-base font-semibold text-slate-900"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-slate-100 pl-11 pr-4 text-base text-slate-600"
                  placeholder="Email Anda (tidak dapat diubah)"
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Email yang digunakan untuk login (tidak dapat diubah)
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-base font-semibold text-slate-900"
              >
                Password Baru
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-14 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#0b6393] focus:ring-2 focus:ring-[#0b6393]/20"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 font-semibold items-center justify-center pr-2 text-slate-600 hover:text-slate-900"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Isi hanya jika ingin mengubah password
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="size-5" aria-hidden="true" />
                Reset Form
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoaderCircle
                      className="size-5 animate-spin"
                      aria-hidden="true"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="size-5" aria-hidden="true" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <CircleCheck
                  className="size-5 text-emerald-700"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Berhasil</h3>
              <p className="mt-2 text-base text-slate-600">{successMessage}</p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={successModal.close}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
              >
                <X className="size-5" aria-hidden="true" />
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Reset
              </h3>
              <p className="mt-2 text-base text-slate-600">
                Apakah Anda yakin ingin mereset form? Nama akan dikembalikan ke
                data asli dan password akan dikosongkan.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetModal.close}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                <X className="size-5" aria-hidden="true" />
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 text-base font-semibold text-white hover:bg-amber-800"
              >
                <RotateCcw className="size-5" aria-hidden="true" />
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {saveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Konfirmasi Simpan
              </h3>
              <p className="mt-2 text-base text-slate-600">
                Apakah Anda yakin ingin menyimpan perubahan pada pengaturan
                akun?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={saveModal.close}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-700 hover:bg-slate-100"
              >
                <X className="size-5" aria-hidden="true" />
                Batal
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b6393] px-5 text-base font-semibold text-white hover:bg-[#0b4f75]"
              >
                <Save className="size-5" aria-hidden="true" />
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingAdminComp;
