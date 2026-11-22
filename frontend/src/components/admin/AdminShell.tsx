import { useState } from "react";
import { Outlet } from "react-router-dom";

import HeaderAdmin from "./HeaderAdmin";
import SidebarAdmin from "./SidebarAdmin";

export default function AdminShell() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <SidebarAdmin
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <HeaderAdmin onOpenSidebar={() => setMobileSidebarOpen(true)} />

      <main className="min-h-screen pt-20 lg:pl-72">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
