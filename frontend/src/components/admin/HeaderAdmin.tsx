import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import LogoutAdminDialog from "./LogoutAdminDialog";

export default function HeaderAdmin() {
  const { nama: userNama, email: userEmail } = getAuthState();
  const dropdown = useDisclosure();
  const logoutDialog = useDisclosure();
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentTime);
  const formattedTime = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900">
            Panel Admin Desa
          </h1>
          <p className="hidden text-sm text-slate-600 sm:block">
            Kelola data dan layanan desa dengan mudah
          </p>
        </div>

        <div className="hidden text-right lg:block">
          <p className="text-base font-bold text-slate-900">
            {formattedTime} WITA
          </p>
          <p className="text-sm text-slate-600">{formattedDate}</p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={dropdown.toggle}
            aria-haspopup="menu"
            aria-expanded={dropdown.isOpen}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <span className="hidden text-right sm:block">
              <span className="block text-base font-bold text-slate-900">
                {userNama}
              </span>
              <span className="block text-sm text-slate-600">
                {userEmail || "Pengguna desa"}
              </span>
            </span>
            <span className="flex size-11 items-center justify-center rounded-full bg-[#0b6393] text-white">
              <UserRound aria-hidden="true" className="size-6" />
            </span>
            <ChevronDown aria-hidden="true" className="size-5 text-slate-600" />
          </button>

          {dropdown.isOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  navigate("/admin/setting");
                  dropdown.close();
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-slate-800 hover:bg-slate-100"
              >
                <Settings aria-hidden="true" className="size-5" />
                Pengaturan
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  logoutDialog.open();
                  dropdown.close();
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-red-700 hover:bg-red-50"
              >
                <LogOut aria-hidden="true" className="size-5" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {logoutDialog.isOpen && (
        <LogoutAdminDialog onClose={logoutDialog.close} />
      )}
    </header>
  );
}
