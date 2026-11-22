import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaBars,
  FaCog,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import { useDisclosure } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import LogoutAdminDialog from "./LogoutAdminDialog";

interface HeaderAdminProps {
  onOpenSidebar: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  beranda: "Dashboard",
  aparat: "Aparat",
  infografis: "Infografis",
  pelayanan: "Pelayanan",
  "status-keluarga": "Status Keluarga",
  berita: "Berita",
  pengumuman: "Pengumuman",
  media: "Media",
  surat: "Arsip Surat",
  "template-surat": "Template Surat",
  "log-cetak": "Log Cetak Surat",
  setting: "Pengaturan",
  "manajemen-admin": "Manajemen Admin",
};

export default function HeaderAdmin({ onOpenSidebar }: HeaderAdminProps) {
  const { nama: userNama, email: userEmail } = getAuthState();
  const dropdown = useDisclosure();
  const logoutDialog = useDisclosure();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!dropdown.isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        dropdown.close();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdown]);

  const segments = location.pathname.split("/").filter(Boolean);
  const currentLabel =
    segments.length > 1
      ? ROUTE_LABELS[segments[1]] ?? segments[1]
      : "Dashboard";

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentTime);

  const navigateToSettings = () => {
    navigate("/admin/setting");
    dropdown.close();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-surface-container-lowest px-4 sm:px-6 lg:left-72 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="rounded-xl p-2 text-on-surface-variant transition-colors hover:bg-surface-container lg:hidden"
        >
          <FaBars />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className="truncate">Dashboard Admin</span>
            <span className="text-border">/</span>
            <span className="truncate text-on-surface">{currentLabel}</span>
          </div>
          <h1 className="truncate text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
            {currentLabel}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <a
          href="/"
          className="hidden items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:flex"
        >
          <FaExternalLinkAlt className="text-xs" />
          <span>Lihat Portal Warga</span>
        </a>

        <button
          type="button"
          onClick={() => navigate("/admin/beranda")}
          title="Lihat notifikasi di dashboard"
          aria-label="Lihat notifikasi di dashboard"
          className="rounded-xl p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <FaBell />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={dropdown.toggle}
            aria-haspopup="menu"
            aria-expanded={dropdown.isOpen}
            className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-surface-container"
          >
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold text-on-surface">
                {userNama || "Admin"}
              </span>
              <span className="block text-xs text-muted-foreground">
                {userEmail || "-"}
              </span>
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
              <FaUser />
            </span>
          </button>

          {dropdown.isOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-2xl border border-border bg-surface-container-lowest p-2 shadow-xl"
            >
              <div className="border-b border-border px-3 py-2 sm:hidden">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {userNama || "Admin"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail || "-"}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={navigateToSettings}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface sm:mt-0"
              >
                <FaCog />
                <span>Pengaturan</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  logoutDialog.open();
                  dropdown.close();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <FaSignOutAlt />
                <span>Keluar</span>
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
