import { Bar, Pie } from "react-chartjs-2";
import "@/lib/chartjs";

import { AdminCard, AdminSectionHeader } from "@/components/admin/admin-ui";
import { formatCurrency, getMonthName } from "@/lib/format";

import type { DanaMasukDisplay, DanaKeluarDisplay } from "./apbdesShared";

interface ApbdesChartsProps {
  totalPendapatan: number;
  totalPengeluaran: number;
  filteredDanaMasuk: DanaMasukDisplay[];
  filteredDanaKeluar: DanaKeluarDisplay[];
}

const chartColor = (variable: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variable).trim() ||
    fallback
  );
};

export default function ApbdesCharts({
  totalPendapatan,
  totalPengeluaran,
  filteredDanaMasuk,
  filteredDanaKeluar,
}: ApbdesChartsProps) {
  const primary = chartColor("--primary-container", "#006948");
  const danger = chartColor("--destructive", "#ef4444");

  const preparePieChartData = () => {
    return {
      labels: ["Pendapatan", "Pengeluaran"],
      datasets: [
        {
          data: [totalPendapatan, totalPengeluaran],
          backgroundColor: [primary, danger],
          borderColor: [primary, danger],
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
          backgroundColor: primary,
          borderColor: primary,
          borderWidth: 1,
        },
        {
          label: "Pengeluaran",
          data: expenseData,
          backgroundColor: danger,
          borderColor: danger,
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AdminCard className="p-6">
        <AdminSectionHeader title="Perbandingan Pendapatan dan Pengeluaran" />
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
      </AdminCard>

      <AdminCard className="p-6">
        <AdminSectionHeader title="Pendapatan dan Pengeluaran Bulanan" />
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
      </AdminCard>
    </div>
  );
}
