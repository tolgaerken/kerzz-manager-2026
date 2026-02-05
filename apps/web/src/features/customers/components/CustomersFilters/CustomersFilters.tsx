import { Search } from "lucide-react";

interface CustomersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function CustomersFilters({
  search,
  onSearchChange
}: CustomersFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
        <input
          type="text"
          placeholder="Müşteri ara (ad, şirket, vergi no...)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      </div>
    </div>
  );
}
