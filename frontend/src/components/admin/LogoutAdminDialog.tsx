import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
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
    } catch (_error) {
      setIsLoggingOut(false);
      if (onClose) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-gray-700/30 flex items-center justify-center z-50"
      style={{ fontFamily: "poppins" }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">Konfirmasi Logout</h3>
          <p className="text-gray-600 text-sm">
            Apakah Anda yakin ingin keluar dari dashboard admin?
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {isLoggingOut ? (
              "Proses..."
            ) : (
              <>
                <FaSignOutAlt />
                <span>Ya, Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutAdminDialog;
