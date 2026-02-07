import { Search, X } from "lucide-react";
import {
  CURRENCY_OPTIONS,
  INTERNAL_FIRM_OPTIONS,
} from "../../constants/eDocCredits.constants";

interface EDocCreditFiltersProps {
  search: string;
  currency: string;
  internalFirm: string;
  onSearchChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onInternalFirmChange: (value: string) => void;
  onClearFilters: () => void;
}

export function EDocCreditFilters({
  search,
  currency,
  internalFirm,
  onSearchChange,
  onCurrencyChange,
  onInternalFirmChange,
  onClearFilters,
}: EDocCreditFiltersProps) {
  const hasFilters = !!search || !!currency || !!internalFirm;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Arama */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ERP ID, müşteri ID, fatura no ile ara..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
        />
      </div>

      {/* Para Birimi Filtresi */}
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tüm Para Birimleri</option>
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Firma Filtresi */}
      <select
        value={internalFirm}
        onChange={(e) => onInternalFirmChange(e.target.value)}
        className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
      >
        <option value="">Tüm Firmalar</option>
        {INTERNAL_FIRM_OPTIONS.map((opt) => (
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
