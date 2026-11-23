import type { LucideIcon } from "lucide-react";

import { CHART_COLORS } from "@/components/Infografis/infografisView";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  colorIndex?: number;
  note?: string;
}

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  colorIndex = 0,
  note,
}: StatCardProps) {
  const color = CHART_COLORS[colorIndex % CHART_COLORS.length];

  return (
    <article className="flex flex-col justify-between gap-5 rounded-2xl bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex size-12 items-center justify-center rounded-xl ${color.bar} ${color.icon}`}>
          <Icon className="size-6" />
        </div>
        {note && (
          <span className="rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold text-on-surface-variant">
            {note}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-on-surface-variant">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-on-surface">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-medium text-on-surface-variant">
              {unit}
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
