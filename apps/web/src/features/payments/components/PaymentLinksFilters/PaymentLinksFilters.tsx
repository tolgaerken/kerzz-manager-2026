import { Search, Filter, X } from "lucide-react";
import { PAYMENTS_CONSTANTS } from "../../constants/payments.constants";

interface PaymentLinksFiltersProps {
  search: string;
  dateRangeDays: number | null;
  status: string;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (days: number | null) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
}

export function PaymentLinksFilters({
  search,
  dateRangeDays,
  status,
  onSearchChange,
  onDateRangeChange,
  onStatusChange,
  onClearFilters
}: PaymentLinksFiltersProps) {
  const hasActiveFilters =
    search || dateRangeDays !== null || status !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
          <input
            type="text"
            placeholder="Müşteri, e-posta veya link ID ara..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            type="button"
            className="flex items-center gap-1 px-3 py-2 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-foreground-muted)]" />

        <select
          value={dateRangeDays ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onDateRangeChange(val === "" ? null : Number(val));
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Tarihler</option>
          {PAYMENTS_CONSTANTS.DATE_RANGE_DAYS.map((days) => (
            <option key={days} value={days}>
              Son {days} gün
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Durumlar</option>
          {PAYMENTS_CONSTANTS.STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
