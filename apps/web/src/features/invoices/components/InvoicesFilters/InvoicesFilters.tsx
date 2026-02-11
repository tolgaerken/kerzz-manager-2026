import { Search, Filter, X, Calendar } from "lucide-react";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { INVOICES_CONSTANTS } from "../../constants/invoices.constants";
import type { InvoiceType, InvoiceCounts } from "../../types";

interface InvoicesFiltersProps {
  search: string;
  invoiceType: InvoiceType | "";
  isPaid: boolean | undefined;
  internalFirm: string;
  selectedYear: number;
  selectedMonth: number;
  counts?: InvoiceCounts;
  onSearchChange: (value: string) => void;
  onInvoiceTypeChange: (value: InvoiceType | "") => void;
  onIsPaidChange: (value: boolean | undefined) => void;
  onInternalFirmChange: (value: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onDatePresetChange: (preset: string) => void;
  onFetchByYearMonth: () => void;
  onClearFilters: () => void;
}

// Yıl seçenekleri (son 5 yıl)
function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i);
  }
  return years;
}

export function InvoicesFilters({
  search,
  invoiceType,
  isPaid,
  internalFirm,
  selectedYear,
  selectedMonth,
  counts,
  onSearchChange,
  onInvoiceTypeChange,
  onIsPaidChange,
  onInternalFirmChange,
  onYearChange,
  onMonthChange,
  onDatePresetChange,
  onFetchByYearMonth,
  onClearFilters
}: InvoicesFiltersProps) {
  const isMobile = useIsMobile();
  const hasActiveFilters =
    search || invoiceType || isPaid !== undefined || internalFirm;

  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const yearOptions = getYearOptions();

  return (
    <div className="space-y-4">
      {/* Arama */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
        <input
          type="text"
          placeholder="Fatura ara (müşteri, fatura no, açıklama...)"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      </div>

      {/* Tarih presetleri - mobilde grid, desktopda flex */}
      <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:gap-2">
        {INVOICES_CONSTANTS.DATE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onDatePresetChange(preset.id)}
            className="w-full md:w-auto px-3 py-2 md:py-1.5 text-xs md:text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Yıl/Ay seçici ve Getir butonu - mobilde tam genişlik */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Calendar className="w-4 h-4 text-[var(--color-foreground-muted)] flex-shrink-0" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="flex-1 md:flex-initial px-3 py-2 md:py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="flex-1 md:flex-initial px-3 py-2 md:py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            {INVOICES_CONSTANTS.MONTHS.map((month) => (
              <option key={month.id} value={month.id}>
                {month.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onFetchByYearMonth}
          className="w-full md:w-auto px-3 py-2 md:py-1.5 text-sm font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Getir
        </button>
      </div>

      {/* Filtreler - mobilde tam genişlik select'ler */}
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-3">
        <Filter className="hidden md:block w-4 h-4 text-[var(--color-foreground-muted)]" />

        {/* Ödeme durumu filtresi */}
        <select
          value={isPaid === undefined ? "" : isPaid.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onIsPaidChange(val === "" ? undefined : val === "true");
          }}
          className="w-full md:w-auto px-3 py-2 md:py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Ödendi {counts && `(${counts.paid})`}</option>
          <option value="false">Ödenmedi {counts && `(${counts.unpaid})`}</option>
        </select>

        {/* Fatura tipi filtresi */}
        <select
          value={invoiceType}
          onChange={(e) => onInvoiceTypeChange(e.target.value as InvoiceType | "")}
          className="w-full md:w-auto px-3 py-2 md:py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Tipler</option>
          {INVOICES_CONSTANTS.INVOICE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {counts?.byType && `(${counts.byType[t.id as keyof typeof counts.byType]})`}
            </option>
          ))}
        </select>

        {/* Firma filtresi */}
        <select
          value={internalFirm}
          onChange={(e) => onInternalFirmChange(e.target.value)}
          className="w-full md:w-auto px-3 py-2 md:py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Firmalar</option>
          {INVOICES_CONSTANTS.INTERNAL_FIRMS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Filtre temizle butonu */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1 px-3 py-2 md:py-1.5 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] transition-colors border border-[var(--color-border)] rounded-md md:border-0"
          >
            <X className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* İstatistikler - sadece desktop'ta görünür */}
      {!isMobile && counts && (
        <div className="flex items-center gap-4 text-sm text-[var(--color-foreground-muted)] pt-2 border-t border-[var(--color-border)]">
          <span>
            Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
          </span>
          <span>
            Vadesi Geçen: <strong className="text-[var(--color-error)]">{counts.overdue}</strong>
          </span>
          <span>
            Toplam Tutar: <strong className="text-[var(--color-info)]">{formatCurrency(counts.totalAmount)}</strong>
          </span>
          <span>
            Ödenen: <strong className="text-[var(--color-success)]">{formatCurrency(counts.paidAmount)}</strong>
          </span>
        </div>
      )}

      {/* İstatistikler - mobil görünüm (kart formatı) */}
      {isMobile && counts && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-foreground-muted)]">Toplam</span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">{counts.total}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-foreground-muted)]">Vadesi Geçen</span>
            <span className="text-sm font-semibold text-[var(--color-error)]">{counts.overdue}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-foreground-muted)]">Toplam Tutar</span>
            <span className="text-sm font-semibold text-[var(--color-info)]">{formatCurrency(counts.totalAmount)}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-foreground-muted)]">Ödenen</span>
            <span className="text-sm font-semibold text-[var(--color-success)]">{formatCurrency(counts.paidAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
