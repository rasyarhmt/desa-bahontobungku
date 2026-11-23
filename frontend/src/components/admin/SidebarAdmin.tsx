import { type JSX, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBullhorn,
  FaChartPie,
  FaCog,
  FaEnvelope,
  FaFileAlt,
  FaHome,
  FaLink,
  FaNewspaper,
  FaPhotoVideo,
  FaPrint,
  FaSearch,
  FaSignOutAlt,
  FaTags,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";

import Logo from "@/assets/ico-morowali.png";
import { useDisclosure } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import LogoutAdminDialog from "./LogoutAdminDialog";

interface MenuItem {
  path: string;
  icon: JSX.Element;
  label: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarAdminProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const MENU_GROUPS: MenuGroup[] = [
  {
    title: "Menu Utama",
    items: [
      { path: "/admin/beranda", icon: <FaHome />, label: "Dashboard" },
      { path: "/admin/aparat", icon: <FaUserTie />, label: "Aparat" },
      { path: "/admin/infografis", icon: <FaChartPie />, label: "Infografis" },
      { path: "/admin/pelayanan", icon: <FaLink />, label: "Pelayanan" },
      {
        path: "/admin/status-keluarga",
        icon: <FaTags />,
        label: "Status Keluarga",
      },
    ],
  },
  {
    title: "Manajemen Konten",
    items: [
      { path: "/admin/berita", icon: <FaNewspaper />, label: "Berita" },
      {
        path: "/admin/pengumuman",
        icon: <FaBullhorn />,
        label: "Pengumuman",
      },
      { path: "/admin/media", icon: <FaPhotoVideo />, label: "Media" },
    ],
  },
  {
    title: "Surat & Arsip",
    items: [
      {
        path: "/admin/template-surat",
        icon: <FaFileAlt />,
        label: "Template Surat",
      },
      { path: "/admin/log-cetak", icon: <FaPrint />, label: "Log Cetak Surat" },
      { path: "/admin/surat", icon: <FaEnvelope />, label: "Arsip Surat" },
    ],
  },
];

export default function SidebarAdmin({
  isMobileOpen,
  onCloseMobile,
}: SidebarAdminProps) {
  const { nama, role } = getAuthState();
  const [searchTerm, setSearchTerm] = useState("");
  const logoutDialog = useDisclosure();
  const navigate = useNavigate();

  const groups: MenuGroup[] = [
    ...MENU_GROUPS,
    ...(role === "superadmin"
      ? [
          {
            title: "Sistem",
            items: [
              {
                path: "/admin/manajemen-admin",
                icon: <FaUserShield />,
                label: "Manajemen Admin",
              },
            ],
          },
        ]
      : []),
  ];

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const navigateToSettings = () => {
    onCloseMobile();
    navigate("/admin/setting");
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-inverse-surface/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-inverse-surface text-inverse-on-surface shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">
          <img src={Logo} alt="Logo Desa" className="h-10 w-10 object-contain" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-white">
              Panel Administrasi
            </p>
            <p className="truncate text-xs text-inverse-on-surface/60">
              {nama || "Administrator"}
            </p>
          </div>
        </div>

        <div className="px-4 pb-3 pt-5">
          <label className="relative block">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inverse-on-surface/50" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari menu admin..."
              aria-label="Cari menu admin"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-inverse-on-surface/40 focus:border-primary-fixed/60 focus:outline-none focus:ring-2 focus:ring-primary-fixed/20"
            />
          </label>
        </div>

        <nav className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-4 pb-6">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-inverse-on-surface/45">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary-container text-on-primary-container shadow-sm"
                            : "text-inverse-on-surface/70 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="px-3 py-6 text-center text-sm text-inverse-on-surface/50">
              Menu tidak ditemukan.
            </p>
          )}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="space-y-1">
            <button
              type="button"
              onClick={navigateToSettings}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-inverse-on-surface/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <FaCog />
              <span>Pengaturan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onCloseMobile();
                logoutDialog.open();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200"
            >
              <FaSignOutAlt />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {logoutDialog.isOpen && (
        <LogoutAdminDialog onClose={logoutDialog.close} />
      )}
    </>
  );
}
