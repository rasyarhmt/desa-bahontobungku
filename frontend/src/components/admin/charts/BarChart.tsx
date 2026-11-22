export interface BarChartItem {
  category: string;
  count: number;
}

interface BarChartProps {
  data: BarChartItem[];
  colors: string[];
  valueKey?: string;
  labelKey?: string;
}

export default function BarChart({
  data,
  colors,
  valueKey = "count",
  labelKey = "category",
}: BarChartProps) {
  const maxValue = Math.max(
    1,
    ...data.map((item) => item[valueKey as keyof BarChartItem] as number),
  );

  return (
    <div className="h-40 w-full">
      <div className="flex h-full items-end justify-around">
        {data.map((item, index) => {
          const val = item[valueKey as keyof BarChartItem] as number;
          const height = (val / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="w-10 rounded-t-md transition-all duration-500 ease-in-out hover:opacity-80"
                style={{
                  height: `${height}%`,
                  backgroundColor: colors[index % colors.length],
                  minHeight: "10%",
                }}
              ></div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {item[labelKey as keyof BarChartItem] as string}
              </div>
              <div className="text-xs font-bold">{val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
