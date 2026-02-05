import { Search, Filter, X } from "lucide-react";
import type { HardwareProductCounts } from "../../types";

interface HardwareProductsFiltersProps {
  search: string;
  saleActiveFilter: boolean | undefined;
  counts?: HardwareProductCounts;
  onSearchChange: (value: string) => void;
  onSaleActiveFilterChange: (value: boolean | undefined) => void;
  onClearFilters: () => void;
}

export function HardwareProductsFilters({
  search,
  saleActiveFilter,
  counts,
  onSearchChange,
  onSaleActiveFilterChange,
  onClearFilters
}: HardwareProductsFiltersProps) {
  const hasActiveFilters = search || saleActiveFilter !== undefined;

  return (
    <div className="space-y-4">
      {/* Üst satır - Arama ve temizle */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
          <input
            type="text"
            placeholder="Donanım ürünü ara (ad, kod, ERP kodu...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Filtre temizle butonu */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Alt satır - Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-foreground-muted)]" />

        {/* Satış durumu filtresi */}
        <select
          value={saleActiveFilter === undefined ? "" : saleActiveFilter.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onSaleActiveFilterChange(val === "" ? undefined : val === "true");
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Satış Durumu</option>
          <option value="true">Satışta {counts && `(${counts.active})`}</option>
          <option value="false">Satışta Değil {counts && `(${counts.inactive})`}</option>
        </select>

        {/* İstatistikler */}
        {counts && (
          <div className="ml-auto flex items-center gap-4 text-sm text-[var(--color-foreground-muted)]">
            <span>
              Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
            </span>
            <span>
              Satışta: <strong className="text-green-500">{counts.active}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
