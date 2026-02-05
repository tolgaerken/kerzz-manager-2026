import { Search, Filter, X, Calendar } from "lucide-react";
import { INVOICES_CONSTANTS } from "../../constants/invoices.constants";
import type { InvoiceType, InvoiceCounts } from "../../types";

interface InvoicesFiltersProps {
  search: string;
  invoiceType: InvoiceType | "";
  isPaid: boolean | undefined;
  internalFirm: string;
  startDate: string;
  endDate: string;
  counts?: InvoiceCounts;
  onSearchChange: (value: string) => void;
  onInvoiceTypeChange: (value: InvoiceType | "") => void;
  onIsPaidChange: (value: boolean | undefined) => void;
  onInternalFirmChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDatePresetChange: (preset: string) => void;
  onClearFilters: () => void;
}

export function InvoicesFilters({
  search,
  invoiceType,
  isPaid,
  internalFirm,
  startDate,
  endDate,
  counts,
  onSearchChange,
  onInvoiceTypeChange,
  onIsPaidChange,
  onInternalFirmChange,
  onStartDateChange,
  onEndDateChange,
  onDatePresetChange,
  onClearFilters
}: InvoicesFiltersProps) {
  const hasActiveFilters =
    search || invoiceType || isPaid !== undefined || internalFirm || startDate || endDate;

  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Üst satır - Arama, tarih preset ve temizle */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-foreground-muted)]" />
          <input
            type="text"
            placeholder="Fatura ara (müşteri, fatura no, açıklama...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* Tarih presetleri */}
        <div className="flex items-center gap-2">
          {INVOICES_CONSTANTS.DATE_PRESETS.slice(0, 3).map((preset) => (
            <button
              key={preset.id}
              onClick={() => onDatePresetChange(preset.id)}
              className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-elevated)] transition-colors"
            >
              {preset.name}
            </button>
          ))}
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

      {/* Alt satır - Filtreler ve tarih aralığı */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-[var(--color-foreground-muted)]" />

        {/* Ödeme durumu filtresi */}
        <select
          value={isPaid === undefined ? "" : isPaid.toString()}
          onChange={(e) => {
            const val = e.target.value;
            onIsPaidChange(val === "" ? undefined : val === "true");
          }}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Durumlar</option>
          <option value="true">Ödendi {counts && `(${counts.paid})`}</option>
          <option value="false">Ödenmedi {counts && `(${counts.unpaid})`}</option>
        </select>

        {/* Fatura tipi filtresi */}
        <select
          value={invoiceType}
          onChange={(e) => onInvoiceTypeChange(e.target.value as InvoiceType | "")}
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
          className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
        >
          <option value="">Tüm Firmalar</option>
          {INVOICES_CONSTANTS.INTERNAL_FIRMS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Tarih aralığı */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-foreground-muted)]" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
          <span className="text-[var(--color-foreground-muted)]">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {/* İstatistikler */}
        {counts && (
          <div className="ml-auto flex items-center gap-4 text-sm text-[var(--color-foreground-muted)]">
            <span>
              Toplam: <strong className="text-[var(--color-foreground)]">{counts.total}</strong>
            </span>
            <span>
              Vadesi Geçen: <strong className="text-red-500">{counts.overdue}</strong>
            </span>
            <span>
              Toplam Tutar: <strong className="text-blue-500">{formatCurrency(counts.totalAmount)}</strong>
            </span>
            <span>
              Ödenen: <strong className="text-green-500">{formatCurrency(counts.paidAmount)}</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
