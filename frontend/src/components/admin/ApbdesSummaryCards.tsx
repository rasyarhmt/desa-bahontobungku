import { FaChartPie, FaMoneyBillWave, FaMoneyCheckAlt } from "react-icons/fa";

import { AdminMetricCard } from "@/components/admin/admin-ui";
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AdminMetricCard
        label="Total Pendapatan"
        value={formatCurrency(totalPendapatan)}
        hint={`Tahun ${selectedYear}`}
        icon={<FaMoneyBillWave />}
        tone="success"
      />
      <AdminMetricCard
        label="Total Pengeluaran"
        value={formatCurrency(totalPengeluaran)}
        hint={`Tahun ${selectedYear}`}
        icon={<FaMoneyCheckAlt />}
        tone="danger"
      />
      <AdminMetricCard
        label="Saldo"
        value={formatCurrency(saldo)}
        hint={`Tahun ${selectedYear}`}
        icon={<FaChartPie />}
        tone={saldo >= 0 ? "success" : "danger"}
      />
    </div>
  );
}
