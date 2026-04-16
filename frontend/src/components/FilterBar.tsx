"use client";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onChange: (value: string) => void;
}

export function FilterBar({ filters, activeFilter, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const isActive = filter.value === activeFilter;
        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={`
              shrink-0 rounded-(--radius-badge) px-3 py-1.5 text-sm font-medium
              transition-all duration-200
              ${
                isActive
                  ? "bg-accent-light text-accent"
                  : "bg-transparent text-muted hover:bg-surface hover:text-foreground"
              }
            `}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
