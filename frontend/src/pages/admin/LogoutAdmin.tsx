import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

import { adminCardClass, adminPrimaryButtonClass } from "@/components/admin/admin-ui";

export default function LogoutAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4">
      <div className={`${adminCardClass} w-full max-w-md p-8 text-center`}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <FaSignOutAlt className="text-2xl" />
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-on-surface">
          Anda telah keluar
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Terima kasih telah menggunakan dashboard admin. Anda telah berhasil
          keluar dari sistem.
        </p>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className={`${adminPrimaryButtonClass} w-full`}
        >
          Login Kembali
        </button>
      </div>
    </div>
  );
}
