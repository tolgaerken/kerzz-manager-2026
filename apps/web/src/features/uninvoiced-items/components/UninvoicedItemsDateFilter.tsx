import { Calendar, Search } from "lucide-react";
import type { DateRangeFilter } from "../types/uninvoiced-items.types";

interface UninvoicedItemsDateFilterProps {
  dateRange: DateRangeFilter;
  onChange: (dateRange: DateRangeFilter) => void;
  onFetch: () => void;
  loading?: boolean;
}

export function UninvoicedItemsDateFilter({
  dateRange,
  onChange,
  onFetch,
  loading,
}: UninvoicedItemsDateFilterProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...dateRange,
      startDate: e.target.value || undefined,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...dateRange,
      endDate: e.target.value || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  const hasFilter = dateRange.startDate || dateRange.endDate;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        <span className="text-sm text-[var(--color-muted-foreground)]">Oluşturma Tarihi:</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateRange.startDate || ""}
          onChange={handleStartDateChange}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
        <span className="text-sm text-[var(--color-muted-foreground)]">-</span>
        <input
          type="date"
          value={dateRange.endDate || ""}
          onChange={handleEndDateChange}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        />
      </div>

      <button
        onClick={onFetch}
        disabled={!hasFilter || loading}
        className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        {loading ? "Yükleniyor..." : "Verileri Getir"}
      </button>

      {hasFilter && (
        <button
          onClick={handleClear}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-foreground)]"
        >
          Temizle
        </button>
      )}
    </div>
  );
}
