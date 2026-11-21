import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Images,
  LayoutDashboard,
  Link2,
  LogOut,
  Mail,
  Megaphone,
  Newspaper,
  PieChart,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  UserRound,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import { useDisclosure } from "@/hooks";
import { getAuthState } from "@/lib/auth";
import LogoutAdminDialog from "./LogoutAdminDialog";

type MenuItem = { path: string; icon: LucideIcon; label: string };

export default function SidebarAdmin() {
  const { nama, role } = getAuthState();
  const userNama = nama || "Admin";
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const logoutDialog = useDisclosure();
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { path: "/admin/beranda", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/aparat", icon: UserRoundCog, label: "Aparat" },
    { path: "/admin/infografis", icon: PieChart, label: "Infografis" },
    { path: "/admin/pelayanan", icon: Link2, label: "Pelayanan" },
    { path: "/admin/status-keluarga", icon: Tags, label: "Status Keluarga" },
    { path: "/admin/template-surat", icon: FileText, label: "Template Surat" },
    { path: "/admin/log-cetak", icon: Printer, label: "Log Cetak Surat" },
    { path: "/admin/media", icon: Images, label: "Media" },
    { path: "/admin/surat", icon: Mail, label: "Arsip Surat" },
    { path: "/admin/berita", icon: Newspaper, label: "Berita" },
    { path: "/admin/pengumuman", icon: Megaphone, label: "Pengumuman" },
  ];

  if (role === "superadmin") {
    menuItems.push({
      path: "/admin/manajemen-admin",
      icon: ShieldCheck,
      label: "Manajemen Admin",
    });
  }

  const filteredMenuItems = menuItems.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div
        className={`flex items-center border-b border-slate-200 p-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0b6393] text-white">
              <UserRound aria-hidden="true" className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Panel Admin
              </p>
              <p className="truncate text-base font-bold text-slate-900">
                {userNama}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Buka menu" : "Tutup menu"}
          title={collapsed ? "Buka menu" : "Tutup menu"}
          className="flex size-11 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          {collapsed ? (
            <ChevronRight aria-hidden="true" className="size-5" />
          ) : (
            <ChevronLeft aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-4">
          <label className="relative block">
            <span className="sr-only">Cari menu</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
            />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari menu..."
              className="w-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-base text-slate-900 shadow-sm"
            />
          </label>
          <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Menu Utama
          </p>
        </div>
      )}

      <nav
        className={`flex-1 overflow-y-auto px-3 pb-4 ${collapsed ? "space-y-2" : "space-y-1"}`}
      >
        {filteredMenuItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `flex min-h-12 items-center rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
        {filteredMenuItems.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-600">
            Menu tidak ditemukan.
          </p>
        )}
      </nav>

      <div
        className={`border-t border-slate-200 p-4 ${collapsed ? "flex flex-col gap-2" : "space-y-2"}`}
      >
        <button
          type="button"
          onClick={() => navigate("/admin/setting")}
          aria-label="Pengaturan"
          title="Pengaturan"
          className={`flex min-h-12 items-center rounded-xl px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Settings aria-hidden="true" className="size-5 shrink-0" />
          {!collapsed && <span>Pengaturan</span>}
        </button>
        <button
          type="button"
          onClick={logoutDialog.open}
          aria-label="Keluar"
          title="Keluar"
          className={`flex min-h-12 items-center rounded-xl px-3 py-3 text-base font-semibold text-red-700 hover:bg-red-50 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LogOut aria-hidden="true" className="size-5 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {logoutDialog.isOpen && (
        <LogoutAdminDialog onClose={logoutDialog.close} />
      )}
    </aside>
  );
}
