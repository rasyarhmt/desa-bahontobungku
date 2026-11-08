import { useState } from "react";
import type { FormEvent } from "react";
import {
  FaCog,
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaUndo,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
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
      <div className="flex items-center justify-center h-screen">
        <p>Memuat data user...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen" style={{ fontFamily: "poppins" }}>
      <div className="w-full mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <FaCog className="text-purple-500 text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        </div>

        <div className="rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Kredensial Akun
              </h2>
              <p className="text-gray-600 text-sm">
                Kelola informasi akun dan kredensial login Anda
              </p>
            </div>
          </div>

          {(error || fetchError) && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error || fetchError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="nama"
                  type="text"
                  value={userData.nama}
                  onChange={(e) =>
                    setUserData({ ...userData, nama: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Nama yang akan ditampilkan di dashboard
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="Email Anda (tidak dapat diubah)"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Email yang digunakan untuk login (tidak dapat diubah)
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={userData.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Isi hanya jika ingin mengubah password
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaUndo />
                <span>Reset Form</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                {isLoading ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <FaSave />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {successModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Berhasil</h3>
              <p className="text-gray-600">{successMessage}</p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={successModal.close}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {resetModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Reset
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin mereset form? Nama akan dikembalikan ke
                data asli dan password akan dikosongkan.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={resetModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {saveModal.isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Konfirmasi Simpan
              </h3>
              <p className="text-gray-600 text-sm">
                Apakah Anda yakin ingin menyimpan perubahan pada pengaturan
                akun?
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={saveModal.close}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
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
