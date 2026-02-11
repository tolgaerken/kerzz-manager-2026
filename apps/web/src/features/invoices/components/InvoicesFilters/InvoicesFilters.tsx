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

// Ortak select stil sabiti
const selectClassName =
  "w-full md:w-auto px-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

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

  if (isMobile) {
    return <MobileFilters
      search={search}
      invoiceType={invoiceType}
      isPaid={isPaid}
      internalFirm={internalFirm}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      counts={counts}
      yearOptions={yearOptions}
      hasActiveFilters={!!hasActiveFilters}
      formatCurrency={formatCurrency}
      onSearchChange={onSearchChange}
      onInvoiceTypeChange={onInvoiceTypeChange}
      onIsPaidChange={onIsPaidChange}
      onInternalFirmChange={onInternalFirmChange}
      onYearChange={onYearChange}
      onMonthChange={onMonthChange}
      onDatePresetChange={onDatePresetChange}
      onFetchByYearMonth={onFetchByYearMonth}
      onClearFilters={onClearFilters}
    />;
  }

  return <DesktopFilters
    search={search}
    invoiceType={invoiceType}
    isPaid={isPaid}
    internalFirm={internalFirm}
    selectedYear={selectedYear}
    selectedMonth={selectedMonth}
    counts={counts}
    yearOptions={yearOptions}
    hasActiveFilters={!!hasActiveFilters}
    formatCurrency={formatCurrency}
    onSearchChange={onSearchChange}
    onInvoiceTypeChange={onInvoiceTypeChange}
    onIsPaidChange={onIsPaidChange}
    onInternalFirmChange={onInternalFirmChange}
    onYearChange={onYearChange}
    onMonthChange={onMonthChange}
    onDatePresetChange={onDatePresetChange}
    onFetchByYearMonth={onFetchByYearMonth}
    onClearFilters={onClearFilters}
  />;
}

/* ─── Shared Props ─── */
interface FilterViewProps {
  search: string;
  invoiceType: InvoiceType | "";
  isPaid: boolean | undefined;
  internalFirm: string;
  selectedYear: number;
  selectedMonth: number;
  counts?: InvoiceCounts;
  yearOptions: number[];
  hasActiveFilters: boolean;
  formatCurrency: (value: number) => string;
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

/* ─── Desktop Layout ─── */
function DesktopFilters({
  search,
  invoiceType,
  isPaid,
  internalFirm,
  selectedYear,
  selectedMonth,
  counts,
  yearOptions,
  hasActiveFilters,
  formatCurrency,
  onSearchChange,
  onInvoiceTypeChange,
  onIsPaidChange,
  onInternalFirmChange,
  onYearChange,
  onMonthChange,
  onDatePresetChange,
  onFetchByYearMonth,
  onClearFilters
}: FilterViewProps) {
  return (
    <div className="space-y-3">
      {/* Satır 1: Arama + Tarih presetleri */}
      <div className="flex items-center gap-3">
        {/* Arama */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder="Fatura ara (müşteri, fatura no, açıklama...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Tarih presetleri */}
        <div className="flex items-center gap-1.5">
          {INVOICES_CONSTANTS.DATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onDatePresetChange(preset.id)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors whitespace-nowrap"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Yıl / Ay / Getir */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] flex-shrink-0" />
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="px-2 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="px-2 py-1.5 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          >
            {INVOICES_CONSTANTS.MONTHS.map((month) => (
              <option key={month.id} value={month.id}>{month.name}</option>
            ))}
          </select>
          <button
            onClick={onFetchByYearMonth}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Getir
          </button>
        </div>
      </div>

      {/* Satır 2: Filtreler + İstatistikler */}
      <div className="flex items-center gap-3">
        {/* Filtreler */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] flex-shrink-0" />

          <select
            value={isPaid === undefined ? "" : isPaid.toString()}
            onChange={(e) => {
              const val = e.target.value;
              onIsPaidChange(val === "" ? undefined : val === "true");
            }}
            className={selectClassName}
          >
            <option value="">Tüm Durumlar</option>
            <option value="true">Ödendi {counts && `(${counts.paid})`}</option>
            <option value="false">Ödenmedi {counts && `(${counts.unpaid})`}</option>
          </select>

          <select
            value={invoiceType}
            onChange={(e) => onInvoiceTypeChange(e.target.value as InvoiceType | "")}
            className={selectClassName}
          >
            <option value="">Tüm Tipler</option>
            {INVOICES_CONSTANTS.INVOICE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {counts?.byType && `(${counts.byType[t.id as keyof typeof counts.byType]})`}
              </option>
            ))}
          </select>

          <select
            value={internalFirm}
            onChange={(e) => onInternalFirmChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Tüm Firmalar</option>
            {INVOICES_CONSTANTS.INTERNAL_FIRMS.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Temizle
            </button>
          )}
        </div>

        {/* İstatistikler - sağa yasla */}
        {counts && (
          <div className="ml-auto flex items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
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
      </div>
    </div>
  );
}

/* ─── Mobile Layout ─── */
function MobileFilters({
  search,
  invoiceType,
  isPaid,
  internalFirm,
  selectedYear,
  selectedMonth,
  counts,
  yearOptions,
  hasActiveFilters,
  formatCurrency,
  onSearchChange,
  onInvoiceTypeChange,
  onIsPaidChange,
  onInternalFirmChange,
  onYearChange,
  onMonthChange,
  onDatePresetChange,
  onFetchByYearMonth,
  onClearFilters
}: FilterViewProps) {
  return (
    <div className="space-y-3">
      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          placeholder="Fatura ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        />
      </div>

      {/* Tarih presetleri + Yıl/Ay/Getir */}
      <div className="flex items-center gap-2">
        {INVOICES_CONSTANTS.DATE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onDatePresetChange(preset.id)}
            className="flex-1 px-2 py-2 text-xs rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          className="flex-1 px-2 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="flex-1 px-2 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          {INVOICES_CONSTANTS.MONTHS.map((month) => (
            <option key={month.id} value={month.id}>{month.name}</option>
          ))}
        </select>
        <button
          onClick={onFetchByYearMonth}
          className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 transition-opacity"
        >
          Getir
        </button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col gap-2">
        <select
          value={isPaid === undefined ? "" : isPaid.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onIsPaidChange(val === "" ? undefined : val === "true");
          }}
          className={selectClassName}
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Ödendi {counts && `(${counts.paid})`}</option>
          <option value="false">Ödenmedi {counts && `(${counts.unpaid})`}</option>
        </select>

        <select
          value={invoiceType}
          onChange={(e) => onInvoiceTypeChange(e.target.value as InvoiceType | "")}
          className={selectClassName}
        >
          <option value="">Tüm Tipler</option>
          {INVOICES_CONSTANTS.INVOICE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} {counts?.byType && `(${counts.byType[t.id as keyof typeof counts.byType]})`}
            </option>
          ))}
        </select>

        <select
          value={internalFirm}
          onChange={(e) => onInternalFirmChange(e.target.value)}
          className={selectClassName}
        >
          <option value="">Tüm Firmalar</option>
          {INVOICES_CONSTANTS.INTERNAL_FIRMS.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors border border-[var(--color-border)] rounded-md"
          >
            <X className="w-4 h-4" />
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* İstatistikler - kart formatı */}
      {counts && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--color-border)]">
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-muted-foreground)]">Toplam</span>
            <span className="text-sm font-semibold text-[var(--color-foreground)]">{counts.total}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-muted-foreground)]">Vadesi Geçen</span>
            <span className="text-sm font-semibold text-[var(--color-error)]">{counts.overdue}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-muted-foreground)]">Toplam Tutar</span>
            <span className="text-sm font-semibold text-[var(--color-info)]">{formatCurrency(counts.totalAmount)}</span>
          </div>
          <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[var(--color-surface-elevated)]">
            <span className="text-xs text-[var(--color-muted-foreground)]">Ödenen</span>
            <span className="text-sm font-semibold text-[var(--color-success)]">{formatCurrency(counts.paidAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
