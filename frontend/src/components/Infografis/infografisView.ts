export const CHART_COLORS = [
  { bar: "bg-primary", icon: "text-on-primary", stroke: "var(--primary)" },
  {
    bar: "bg-tertiary-fixed-dim",
    icon: "text-on-tertiary-fixed",
    stroke: "var(--tertiary-fixed-dim)",
  },
  {
    bar: "bg-primary-fixed-dim",
    icon: "text-on-primary-fixed",
    stroke: "var(--primary-fixed-dim)",
  },
  {
    bar: "bg-primary-container",
    icon: "text-on-primary-container",
    stroke: "var(--primary-container)",
  },
  { bar: "bg-outline", icon: "text-on-primary", stroke: "var(--outline)" },
];

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("id-ID").format(value);

export const toPercent = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 1000) / 10 : 0;

export const formatPercent = (value: number, total: number): string =>
  `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(toPercent(value, total))}%`;
