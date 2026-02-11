import { Search, X } from "lucide-react";
import { OFFERS_CONSTANTS } from "../../constants/offers.constants";
import type { OfferQueryParams, OfferStatus } from "../../types/offer.types";

export interface OffersFiltersProps {
  filters: OfferQueryParams;
  onFilterChange: (filters: Partial<OfferQueryParams>) => void;
}

export function OffersFilters({
  filters,
  onFilterChange,
}: OffersFiltersProps) {
  const search = filters.search || "";
  const status = filters.status;
  const hasFilters = !!search || (!!status && status !== "all");

  const onSearchChange = (value: string) => onFilterChange({ search: value });
  const onStatusChange = (value: string) => onFilterChange({ status: (value || undefined) as OfferStatus | "all" | undefined });
  const onClearFilters = () => onFilterChange({ search: "", status: undefined });

  return (
    <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
      {/* Arama - Desktop'ta göster, mobilde gizle (ayrı OfferSearchInput var) */}
      <div className="relative hidden flex-1 min-w-[200px] max-w-sm md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Referans, müşteri, satıcı ile ara..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Durum Filtresi - Mobilde tam genişlik */}
      <select
        value={status || ""}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 md:w-auto"
      >
        {OFFERS_CONSTANTS.OFFER_STATUSES.map((opt) => (
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
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors md:justify-start"
        >
          <X className="w-4 h-4" />
          Temizle
        </button>
      )}
    </div>
  );
}
