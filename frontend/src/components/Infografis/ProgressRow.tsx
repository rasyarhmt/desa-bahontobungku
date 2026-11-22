import {
  CHART_COLORS,
  formatNumber,
  formatPercent,
} from "@/components/Infografis/infografisView";

interface ProgressRowProps {
  label: string;
  value: number;
  total: number;
  colorIndex?: number;
  valueLabel?: string;
}

export default function ProgressRow({
  label,
  value,
  total,
  colorIndex = 0,
  valueLabel,
}: ProgressRowProps) {
  const percent = formatPercent(value, total);
  const color = CHART_COLORS[colorIndex % CHART_COLORS.length].bar;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <span className="flex items-center gap-2 text-on-surface">
          <span className={`size-3 rounded-full ${color}`} />
          {label}
        </span>
        <span className="text-on-surface-variant">
          {valueLabel ?? formatNumber(value)} · {percent}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
