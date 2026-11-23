import { Clock3, History } from "lucide-react";

import { CONTAINER_CLASS, cn } from "@/lib/utils";
import type { BeritaSort } from "./beritaView";

interface BeritaFiltersProps {
  sort: BeritaSort;
  onSortChange: (sort: BeritaSort) => void;
  resultCount: number;
}

const SORTS: { value: BeritaSort; label: string; icon: typeof Clock3 }[] = [
  { value: "terbaru", label: "Terbaru", icon: Clock3 },
  { value: "terlama", label: "Terlama", icon: History },
];

export default function BeritaFilters({
  sort,
  onSortChange,
  resultCount,
}: BeritaFiltersProps) {
  return (
    <section className="w-full bg-surface-container-lowest shadow-sm">
      <div className={`${CONTAINER_CLASS} flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="inline-flex w-fit rounded-full bg-surface-container p-1">
          {SORTS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onSortChange(value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all",
                sort === value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-transparent text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-medium text-on-surface-variant">
          Menampilkan {resultCount} berita
        </span>
      </div>
    </section>
  );
}
