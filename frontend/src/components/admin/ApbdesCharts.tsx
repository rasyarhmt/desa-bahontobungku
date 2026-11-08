import { Bar, Pie } from "react-chartjs-2";
import "@/lib/chartjs";

import { formatCurrency, getMonthName } from "@/lib/format";

import type { DanaMasukDisplay, DanaKeluarDisplay } from "./apbdesShared";

interface ApbdesChartsProps {
  totalPendapatan: number;
  totalPengeluaran: number;
  filteredDanaMasuk: DanaMasukDisplay[];
  filteredDanaKeluar: DanaKeluarDisplay[];
}

export default function ApbdesCharts({
  totalPendapatan,
  totalPengeluaran,
  filteredDanaMasuk,
  filteredDanaKeluar,
}: ApbdesChartsProps) {
  const preparePieChartData = () => {
    return {
      labels: ["Pendapatan", "Pengeluaran"],
      datasets: [
        {
          data: [totalPendapatan, totalPengeluaran],
          backgroundColor: ["#10b981", "#ef4444"],
          borderColor: ["#10b981", "#ef4444"],
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareBarChartData = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const incomeByMonth = new Map<number, number>();
    filteredDanaMasuk.forEach((item) => {
      const month = Number.parseInt(String(item.bulan));
      incomeByMonth.set(
        month,
        (incomeByMonth.get(month) || 0) + Number.parseInt(String(item.jumlah ?? 0)),
      );
    });

    const expenseByMonth = new Map<number, number>();
    filteredDanaKeluar.forEach((item) => {
      const month = Number.parseInt(String(item.bulan));
      expenseByMonth.set(
        month,
        (expenseByMonth.get(month) || 0) +
          Number.parseInt(String(item.jumlah ?? 0)),
      );
    });

    const incomeData = months.map((month) => incomeByMonth.get(month) || 0);
    const expenseData = months.map((month) => expenseByMonth.get(month) || 0);

    return {
      labels: months.map((month) => getMonthName(month)),
      datasets: [
        {
          label: "Pendapatan",
          data: incomeData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
        {
          label: "Pengeluaran",
          data: expenseData,
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Perbandingan Pendapatan dan Pengeluaran
        </h3>
        <div className="h-64">
          <Pie
            data={preparePieChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                },
                tooltip: {
                  callbacks: {
                    label: (context: { label?: string; raw?: unknown }) => {
                      const value = context.raw as number;
                      return `${context.label}: ${formatCurrency(value)}`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Pendapatan dan Pengeluaran Bulanan
        </h3>
        <div className="h-64">
          <Bar
            data={prepareBarChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                },
                tooltip: {
                  callbacks: {
                    label: (context: {
                      dataset?: { label?: string };
                      raw?: unknown;
                    }) => {
                      const value = context.raw as number;
                      return `${context.dataset?.label}: ${formatCurrency(value)}`;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: string | number) =>
                      formatCurrency(Number(value)),
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
