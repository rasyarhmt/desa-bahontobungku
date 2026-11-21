import { Outlet } from "react-router-dom";
import SidebarAdmin from "@/components/admin/SidebarAdmin";
import HeaderAdmin from "@/components/admin/HeaderAdmin";

export default function DashboardAdmin() {
  return (
    <div className="admin-app flex min-h-screen">
      <SidebarAdmin />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderAdmin />
        <main className="flex-1 overflow-y-auto bg-[#f6f8fb] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
