import { Search, CheckCircle2 } from "lucide-react";

interface CustomersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeContractsOnly: boolean;
  onActiveContractsOnlyChange: (value: boolean) => void;
}

export function CustomersFilters({
  search,
  onSearchChange,
  activeContractsOnly,
  onActiveContractsOnlyChange
}: CustomersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
        <input
          type="text"
          placeholder="Müşteri ara (ad, şirket, vergi no...)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      </div>

      {/* Aktif Müşteriler Toggle */}
      <button
        type="button"
        onClick={() => onActiveContractsOnlyChange(!activeContractsOnly)}
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          activeContractsOnly
            ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border)] hover:text-[var(--color-foreground)]"
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
        Aktif Müşteriler
      </button>
    </div>
  );
}
