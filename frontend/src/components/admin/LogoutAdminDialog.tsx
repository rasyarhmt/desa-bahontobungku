import { useState } from "react";
import { LogOut } from "lucide-react";
import { authApi } from "@/lib/api/auth";

interface LogoutAdminDialogProps {
  onClose: () => void;
}

const LogoutAdminDialog = ({ onClose }: LogoutAdminDialogProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    try {
      authApi.logout();
    } catch {
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
            <LogOut aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h3 id="logout-title" className="text-xl font-bold text-slate-900">
              Keluar dari panel admin?
            </h3>
            <p className="mt-1 text-base text-slate-600">
              Anda perlu masuk kembali untuk mengelola data desa.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-base font-bold text-white hover:bg-red-800 disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="size-5" />
            {isLoggingOut ? "Memproses..." : "Ya, keluar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutAdminDialog;
