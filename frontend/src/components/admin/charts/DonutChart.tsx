export interface DonutChartItem {
  label: string;
  count: number;
}

interface DonutChartProps {
  data: DonutChartItem[];
  colors: string[];
}

export default function DonutChart({ data, colors }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let startAngle = 0;

  if (total === 0) {
    return (
      <div className="w-32 h-32 mx-auto flex items-center justify-center rounded-full border-8 border-gray-100 text-sm text-gray-400">
        Kosong
      </div>
    );
  }

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, index) => {
          const percentage = item.count / total;
          const angle = percentage * 360;
          const endAngle = startAngle + angle;

          if (percentage >= 0.9999) {
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill={colors[index % colors.length]}
              />
            );
          }

          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = `
            M 50 50
            L ${x1} ${y1}
            A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          const currentPath = (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth="1"
            />
          );

          startAngle = endAngle;
          return currentPath;
        })}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
        {total}
      </div>
    </div>
  );
}
