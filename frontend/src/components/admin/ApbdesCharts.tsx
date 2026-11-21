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
          backgroundColor: ["#0b6393", "#b91c1c"],
          borderColor: ["#0b6393", "#b91c1c"],
          borderWidth: 2,
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
          backgroundColor: "rgba(11, 99, 147, 0.85)",
          borderColor: "#0b6393",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "Pengeluaran",
          data: expenseData,
          backgroundColor: "rgba(185, 28, 28, 0.8)",
          borderColor: "#b91c1c",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Perbandingan Pendapatan dan Pengeluaran
        </h3>
        <div className="h-72">
          <Pie
            data={preparePieChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#0f172a",
                    font: { size: 14 },
                    padding: 20,
                    usePointStyle: true,
                  },
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Pendapatan dan Pengeluaran Bulanan
        </h3>
        <div className="h-72">
          <Bar
            data={prepareBarChartData()}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#0f172a",
                    font: { size: 14 },
                    padding: 16,
                    usePointStyle: true,
                  },
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
                x: {
                  ticks: { color: "#334155", font: { size: 14 } },
                  grid: { color: "#e2e8f0" },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: "#334155",
                    font: { size: 14 },
                    callback: (value: string | number) =>
                      formatCurrency(Number(value)),
                  },
                  grid: { color: "#e2e8f0" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
