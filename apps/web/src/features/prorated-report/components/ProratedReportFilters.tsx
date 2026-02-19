import { RotateCw } from "lucide-react";
import type { ProratedReportFilter } from "../types/prorated-report.types";

interface ProratedReportFiltersProps {
  filter: ProratedReportFilter;
  onChange: (filter: ProratedReportFilter) => void;
  onRefresh: () => void;
  refreshing?: boolean;
  totalCount: number;
  totalAmount: number;
}

export function ProratedReportFilters({
  filter,
  onChange,
  onRefresh,
  refreshing = false,
  totalCount,
  totalAmount,
}: ProratedReportFiltersProps) {
  const handlePaidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filter,
      paid: val === "" ? undefined : val === "true",
    });
  };

  const handleInvoicedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...filter,
      invoiced: val === "" ? undefined : val === "true",
    });
  };

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Filtreler */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
          Ödeme:
        </label>
        <select
          value={filter.paid === undefined ? "" : String(filter.paid)}
          onChange={handlePaidChange}
          className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-foreground)]"
        >
          <option value="">Tümü</option>
          <option value="true">Ödendi</option>
          <option value="false">Ödenmedi</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[var(--color-muted-foreground)]">
          Fatura:
        </label>
        <select
          value={filter.invoiced === undefined ? "" : String(filter.invoiced)}
          onChange={handleInvoicedChange}
          className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs text-[var(--color-foreground)]"
        >
          <option value="">Tümü</option>
          <option value="true">Faturalı</option>
          <option value="false">Faturasız</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-8 items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-xs font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        Yenile
      </button>

      {/* Özet */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-xs text-[var(--color-muted-foreground)]">
          <span className="font-semibold text-[var(--color-foreground)]">{totalCount}</span> kayıt
        </span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Toplam:{" "}
          <span className="font-semibold text-[var(--color-foreground)]">
            {formatAmount(totalAmount)} TL
          </span>
        </span>
      </div>
    </div>
  );
}
