import { Search, X } from "lucide-react";
import type { LeadQueryParams } from "../../types/lead.types";

interface LeadsFiltersProps {
  filters: LeadQueryParams;
  onFilterChange: (filters: Partial<LeadQueryParams>) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tüm Durumlar" },
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "İletişime Geçildi" },
  { value: "qualified", label: "Nitelikli" },
  { value: "unqualified", label: "Niteliksiz" },
  { value: "converted", label: "Dönüştürüldü" },
  { value: "lost", label: "Kaybedildi" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "Tüm Öncelikler" },
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "urgent", label: "Acil" },
];

export function LeadsFilters({ filters, onFilterChange }: LeadsFiltersProps) {
  const hasFilters =
    !!filters.search ||
    (!!filters.status && filters.status !== "all") ||
    (!!filters.priority && filters.priority !== "all");

  const handleClearFilters = () => {
    onFilterChange({
      search: "",
      status: "all",
      priority: "all",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Arama */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Lead ara (ad, firma, e-posta)..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Durum Filtresi */}
      <select
        value={filters.status || "all"}
        onChange={(e) => onFilterChange({ status: e.target.value as LeadQueryParams["status"] })}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 min-w-[160px]"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Öncelik Filtresi */}
      <select
        value={filters.priority || "all"}
        onChange={(e) => onFilterChange({ priority: e.target.value as LeadQueryParams["priority"] })}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 min-w-[160px]"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Temizle */}
      {hasFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="w-4 h-4" />
          Temizle
        </button>
      )}
    </div>
  );
}
