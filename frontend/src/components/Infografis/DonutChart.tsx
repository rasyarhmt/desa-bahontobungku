import { CHART_COLORS, formatNumber } from "@/components/Infografis/infografisView";

export interface DonutSegment {
  label: string;
  value: number;
  colorIndex?: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue?: string;
}

const RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;

  return (
    <div className="relative size-44 shrink-0">
      <svg className="size-full -rotate-90" viewBox="0 0 120 120" role="img" aria-label={centerLabel}>
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke="var(--surface-container)"
          strokeWidth="14"
        />
        {total > 0 &&
          segments.map((segment, index) => {
            const length = (segment.value / total) * CIRCUMFERENCE;
            const dashOffset = -offset;
            offset += length;
            const color =
              CHART_COLORS[segment.colorIndex ?? index % CHART_COLORS.length].stroke;

            return (
              <circle
                key={`${segment.label}-${index}`}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke={color}
                strokeWidth="14"
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold text-on-surface">
          {centerValue ?? formatNumber(total)}
        </span>
        <span className="text-[11px] text-on-surface-variant">{centerLabel}</span>
      </div>
    </div>
  );
}
