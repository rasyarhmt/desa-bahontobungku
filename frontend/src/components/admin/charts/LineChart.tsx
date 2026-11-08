export interface LineChartItem {
  month: string;
  count: number;
}

interface LineChartProps {
  data: LineChartItem[];
  color: string;
  valueKey?: string;
  labelKey?: string;
}

export default function LineChart({
  data,
  color,
  valueKey = "count",
  labelKey = "month",
}: LineChartProps) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => item[valueKey as keyof LineChartItem] as number),
  );
  const points = data.map((item, index) => {
    const x = data.length > 1 ? (index / (data.length - 1)) * 100 : 50;
    const y =
      100 -
      ((item[valueKey as keyof LineChartItem] as number) / maxValue) * 100;
    return {
      x,
      y,
      value: item[valueKey as keyof LineChartItem] as number,
      label: item[labelKey as keyof LineChartItem] as string,
    };
  });

  const pathData = points
    .map((point, index) => (index === 0 ? "M " : "L ") + point.x + " " + point.y)
    .join(" ");

  return (
    <div className="w-full h-40 mt-4">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <line
          x1="0"
          y1="0"
          x2="100"
          y2="0"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="100"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />

        <path d={pathData} fill="none" stroke={color} strokeWidth="2" />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill="white"
              stroke={color}
              strokeWidth="1.5"
            />
            <text
              x={point.x}
              y="100"
              textAnchor="middle"
              fontSize="8"
              fill="#6b7280"
              dy="10"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
