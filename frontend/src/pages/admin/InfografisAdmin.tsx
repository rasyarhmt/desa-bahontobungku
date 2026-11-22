import { useState } from "react";

import APBDes from "@/components/admin/APBDes";
import Penduduk from "@/components/admin/Penduduk";
import {
  AdminFilterTabs,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin/admin-ui";

export default function InfografisAdmin() {
  const [activeTab, setActiveTab] = useState<"penduduk" | "apbdes">("penduduk");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Statistik Desa"
        title="Infografis Desa"
        description="Lihat data kependudukan dan anggaran desa dalam satu tempat."
      />

      <AdminToolbar>
        <AdminFilterTabs
          tabs={[
            { value: "penduduk", label: "Penduduk" },
            { value: "apbdes", label: "APBDes" },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </AdminToolbar>

      <div className="transition-all duration-300">
        {activeTab === "penduduk" && <Penduduk />}
        {activeTab === "apbdes" && <APBDes />}
      </div>
    </div>
  );
}
