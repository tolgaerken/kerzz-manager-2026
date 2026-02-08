import { Search, X } from "lucide-react";
import { SALES_CONSTANTS } from "../../constants/sales.constants";
import type { SaleQueryParams } from "../../types/sale.types";

export interface SalesFiltersProps {
  filters: SaleQueryParams;
  onFilterChange: (filters: Partial<SaleQueryParams>) => void;
}

export function SalesFilters({
  filters,
  onFilterChange,
}: SalesFiltersProps) {
  const search = filters.search || "";
  const status = filters.status || "";
  const hasFilters = !!search || !!status;

  const onSearchChange = (value: string) => onFilterChange({ search: value });
  const onStatusChange = (value: string) => onFilterChange({ status: value });
  const onClearFilters = () => onFilterChange({ search: "", status: "" });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Arama */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Müşteri, satıcı, referans ile ara..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Durum Filtresi */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tüm Durumlar</option>
        {SALES_CONSTANTS.SALE_STATUSES.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Temizle */}
      {hasFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="w-4 h-4" />
          Temizle
        </button>
      )}
    </div>
  );
}
