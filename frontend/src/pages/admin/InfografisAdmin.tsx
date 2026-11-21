import { useState } from "react";
import { Banknote, PieChart, UsersRound } from "lucide-react";
import Penduduk from "@/components/admin/Penduduk";
import APBDes from "@/components/admin/APBDes";

export default function InfografisAdmin() {
  const [activeTab, setActiveTab] = useState("penduduk");

  return (
    <div
      className="min-h-screen bg-[#f6f8fb] p-6"
     
    >
      <div className="mx-auto w-full">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[#0b6393]/10 p-2">
            <PieChart aria-hidden="true" className="size-5 text-[#0b6393]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Infografis Desa</h1>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("penduduk")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 font-semibold transition-colors ${
                activeTab === "penduduk"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <UsersRound
                aria-hidden="true"
                className={`size-5 ${activeTab === "penduduk" ? "text-white" : "text-[#0b6393]"}`}
              />
              <span>Penduduk</span>
            </button>
            <button
              onClick={() => setActiveTab("apbdes")}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-5 font-semibold transition-colors ${
                activeTab === "apbdes"
                  ? "bg-[#0b6393] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Banknote
                aria-hidden="true"
                className={`size-5 ${activeTab === "apbdes" ? "text-white" : "text-[#0b6393]"}`}
              />
              <span>APBDes</span>
            </button>
          </div>
        </div>

        <div className="transition-all duration-300">
          {activeTab === "penduduk" && <Penduduk />}
          {activeTab === "apbdes" && <APBDes />}
        </div>
      </div>
    </div>
  );
}
