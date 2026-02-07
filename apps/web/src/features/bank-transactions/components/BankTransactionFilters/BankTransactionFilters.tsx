import { useCallback } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { BANK_TRANSACTIONS_CONSTANTS } from "../../constants";
import type { DateRange } from "../../types";

interface BankTransactionFiltersProps {
  dateRange: DateRange;
  selectedStatus: string;
  onDateRangeChange: (dateRange: DateRange) => void;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function BankTransactionFilters({
  dateRange,
  selectedStatus,
  onDateRangeChange,
  onStatusChange,
  onRefresh,
  isLoading,
}: BankTransactionFiltersProps) {
  const { STATUS_OPTIONS, DATE_PRESETS } = BANK_TRANSACTIONS_CONSTANTS;

  const handleStartDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDateRangeChange({
        ...dateRange,
        startDate: e.target.value ? new Date(e.target.value) : new Date(),
      });
    },
    [dateRange, onDateRangeChange],
  );

  const handleEndDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onDateRangeChange({
        ...dateRange,
        endDate: e.target.value ? new Date(e.target.value) : new Date(),
      });
    },
    [dateRange, onDateRangeChange],
  );

  const handlePresetClick = useCallback(
    (presetId: string) => {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (presetId) {
        case "today":
          startDate = new Date(today.setHours(0, 0, 0, 0));
          endDate = new Date(new Date().setHours(23, 59, 59, 999));
          break;
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.setHours(0, 0, 0, 0));
          endDate = new Date(yesterday.setHours(23, 59, 59, 999));
          break;
        }
        case "thisWeek": {
          const day = today.getDay();
          const diff = today.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(today.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        case "lastWeek": {
          const currentDay = today.getDay();
          const diffToMonday =
            today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
          const thisMonday = new Date(today.setDate(diffToMonday));
          startDate = new Date(thisMonday);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        }
        default:
          return;
      }

      onDateRangeChange({ startDate, endDate });
    },
    [onDateRangeChange],
  );

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-surface">
      {/* Durum Filtresi */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted whitespace-nowrap">
          Durum:
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tümü</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tarih Araligi */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-subtle" />
        <input
          type="date"
          value={formatDateForInput(dateRange.startDate)}
          onChange={handleStartDateChange}
          className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <span className="text-subtle">-</span>
        <input
          type="date"
          value={formatDateForInput(dateRange.endDate)}
          onChange={handleEndDateChange}
          min={formatDateForInput(dateRange.startDate)}
          className="rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Hizli Tarih Butonlari */}
      <div className="flex items-center gap-1">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className="rounded-md px-3 py-1.5 text-xs font-medium border border-border-subtle bg-surface-elevated text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Yenile Butonu */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="ml-auto flex items-center gap-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        <RefreshCw
          className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        Yenile
      </button>
    </div>
  );
}
