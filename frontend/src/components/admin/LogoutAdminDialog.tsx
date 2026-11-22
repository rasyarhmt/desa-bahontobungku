import { useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { authApi } from "@/lib/api/auth";

import {
  adminCardClass,
  adminDangerButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import ModalPortal from "./ModalPortal";

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
    <ModalPortal>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/50 p-4 backdrop-blur-sm">
        <div className={`${adminCardClass} w-full max-w-md p-6`}>
          <div className="mb-6 flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <FaSignOutAlt />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-on-surface">
                Konfirmasi Logout
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Apakah Anda yakin ingin keluar dari dashboard admin?
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={adminSecondaryButtonClass}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={adminDangerButtonClass}
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
    </ModalPortal>
  );
};

export default LogoutAdminDialog;
