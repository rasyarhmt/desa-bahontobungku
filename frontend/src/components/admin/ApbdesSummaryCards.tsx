import { Banknote, Wallet, PieChart } from "lucide-react";

import { formatCurrency } from "@/lib/format";

interface ApbdesSummaryCardsProps {
  totalPendapatan: number;
  totalPengeluaran: number;
  saldo: number;
  selectedYear: string;
}

export default function ApbdesSummaryCards({
  totalPendapatan,
  totalPengeluaran,
  saldo,
  selectedYear,
}: ApbdesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Total Pendapatan
          </h3>
          <div className="rounded-xl bg-emerald-50 p-2">
            <Banknote aria-hidden="true" className="size-5 text-emerald-700" />
          </div>
        </div>
        <div className="mb-1 text-2xl font-bold text-slate-900">
          {formatCurrency(totalPendapatan)}
        </div>
        <p className="text-base text-slate-600">Tahun {selectedYear}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Total Pengeluaran
          </h3>
          <div className="rounded-xl bg-red-50 p-2">
            <Wallet aria-hidden="true" className="size-5 text-red-700" />
          </div>
        </div>
        <div className="mb-1 text-2xl font-bold text-slate-900">
          {formatCurrency(totalPengeluaran)}
        </div>
        <p className="text-base text-slate-600">Tahun {selectedYear}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">Saldo</h3>
          <div className="rounded-xl bg-slate-100 p-2">
            <PieChart aria-hidden="true" className="size-5 text-[#0b6393]" />
          </div>
        </div>
        <div
          className={`mb-1 text-2xl font-bold ${
            saldo >= 0 ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {formatCurrency(saldo)}
        </div>
        <p className="text-base text-slate-600">Tahun {selectedYear}</p>
      </div>
    </div>
  );
}
