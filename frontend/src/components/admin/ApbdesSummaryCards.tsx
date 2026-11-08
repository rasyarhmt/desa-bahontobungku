import { FaMoneyBillWave, FaMoneyCheckAlt, FaChartPie } from "react-icons/fa";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Total Pendapatan
          </h3>
          <div className="bg-green-100 p-2 rounded-lg">
            <FaMoneyBillWave className="text-green-500 text-xl" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalPendapatan)}
        </div>
        <p className="text-sm text-gray-600">Tahun {selectedYear}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Total Pengeluaran
          </h3>
          <div className="bg-red-100 p-2 rounded-lg">
            <FaMoneyCheckAlt className="text-red-500 text-xl" />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatCurrency(totalPengeluaran)}
        </div>
        <p className="text-sm text-gray-600">Tahun {selectedYear}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Saldo</h3>
          <div className="bg-blue-100 p-2 rounded-lg">
            <FaChartPie className="text-blue-500 text-xl" />
          </div>
        </div>
        <div
          className={`text-3xl font-bold mb-1 ${
            saldo >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(saldo)}
        </div>
        <p className="text-sm text-gray-600">Tahun {selectedYear}</p>
      </div>
    </div>
  );
}
