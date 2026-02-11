import { useCallback } from "react";
import { RefreshCw, FileText, CheckCircle } from "lucide-react";
import { CONTRACT_INVOICES_CONSTANTS } from "../constants";
import type { PeriodType } from "../types";

interface ContractInvoicesToolbarProps {
  period: PeriodType;
  date: string;
  selectedCount: number;
  loading: boolean;
  onPeriodChange: (period: PeriodType) => void;
  onDateChange: (date: string) => void;
  onLoadRecords: () => void;
  onCreateInvoices: () => void;
  onCheckContracts: () => void;
  isCreating: boolean;
  isChecking: boolean;
  /** Mobil görünüm mü? */
  isMobile?: boolean;
}

export function ContractInvoicesToolbar({
  period,
  date,
  selectedCount,
  loading,
  onPeriodChange,
  onDateChange,
  onLoadRecords,
  onCreateInvoices,
  onCheckContracts,
  isCreating,
  isChecking,
  isMobile = false,
}: ContractInvoicesToolbarProps) {
  const handlePeriodChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onPeriodChange(e.target.value as PeriodType);
    },
    [onPeriodChange],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDateChange(e.target.value);
    },
    [onDateChange],
  );

  // Mobil görünüm
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {/* Dönem ve tarih seçimi */}
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={handlePeriodChange}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {CONTRACT_INVOICES_CONSTANTS.PERIOD_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>

          <input
            type="month"
            value={date}
            onChange={handleDateChange}
            className="flex-1 px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* Kayıtları getir butonu */}
        <button
          onClick={onLoadRecords}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Kayıtları Getir
        </button>
      </div>
    );
  }

  // Desktop görünüm
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {/* Sol: Donem ve tarih secimi */}
      <div className="flex items-center gap-3">
        <select
          value={period}
          onChange={handlePeriodChange}
          className="px-3 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          {CONTRACT_INVOICES_CONSTANTS.PERIOD_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>

        <input
          type="month"
          value={date}
          onChange={handleDateChange}
          className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        <button
          onClick={onLoadRecords}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
          Kayıtları Getir
        </button>
      </div>

      {/* Sag: Aksiyon butonlari */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <span className="text-sm text-[var(--color-muted-foreground)] mr-2">
            {selectedCount} kayıt seçili
          </span>
        )}

        <button
          onClick={onCreateInvoices}
          disabled={selectedCount === 0 || isCreating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-success-foreground)] bg-[var(--color-success)] rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          {isCreating ? "Oluşturuluyor..." : "Fatura Oluştur"}
        </button>

        <button
          onClick={onCheckContracts}
          disabled={selectedCount === 0 || isChecking}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          {isChecking ? "Kontrol Ediliyor..." : "Kontrat Kontrol"}
        </button>
      </div>
    </div>
  );
}
