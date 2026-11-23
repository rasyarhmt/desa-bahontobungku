import { Search } from "lucide-react";

import { CONTAINER_CLASS, cn } from "@/lib/utils";
import { MEDIA_FILTERS, type MediaFilterValue } from "./mediaShared";

interface MediaFiltersProps {
  active: MediaFilterValue;
  onChange: (value: MediaFilterValue) => void;
  query: string;
  onQueryChange: (value: string) => void;
}

export default function MediaFilters({
  active,
  onChange,
  query,
  onQueryChange,
}: MediaFiltersProps) {
  return (
    <section className="w-full bg-surface-container-lowest shadow-sm">
      <div className={`${CONTAINER_CLASS} overflow-x-auto py-4`}>
        <div className="flex min-w-max items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {MEDIA_FILTERS.map(({ value, label, icon: Icon }) => {
              const selected = active === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onChange(value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all",
                    selected
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container text-on-surface hover:bg-surface-container-high",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Cari dokumentasi desa..."
              className="w-64 rounded-full bg-surface-container-low py-2 pr-4 pl-10 text-sm text-on-surface outline-none placeholder:text-outline focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
