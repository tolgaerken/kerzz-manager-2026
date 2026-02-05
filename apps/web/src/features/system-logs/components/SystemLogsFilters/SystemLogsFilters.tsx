import { Search, X } from "lucide-react";
import type { SystemLogCategory, SystemLogAction, SystemLogStatus } from "../../types";
import {
  CATEGORY_LABELS,
  ACTION_LABELS,
  STATUS_LABELS,
} from "../../constants/system-logs.constants";

interface SystemLogsFiltersProps {
  search: string;
  category: SystemLogCategory | "";
  action: SystemLogAction | "";
  status: SystemLogStatus | "";
  module: string;
  startDate: string;
  endDate: string;
  modules: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: SystemLogCategory | "") => void;
  onActionChange: (value: SystemLogAction | "") => void;
  onStatusChange: (value: SystemLogStatus | "") => void;
  onModuleChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
}

export function SystemLogsFilters({
  search,
  category,
  action,
  status,
  module: moduleName,
  startDate,
  endDate,
  modules,
  onSearchChange,
  onCategoryChange,
  onActionChange,
  onStatusChange,
  onModuleChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: SystemLogsFiltersProps) {
  const hasActiveFilters =
    search || category || action || status || moduleName || startDate || endDate;

  const categoryOptions = Object.entries(CATEGORY_LABELS);
  const statusOptions = Object.entries(STATUS_LABELS);

  // Kategoriye göre filtrelenmiş aksiyonlar
  const getFilteredActions = () => {
    const allActions = Object.entries(ACTION_LABELS);
    if (!category) return allActions;

    const categoryActionMap: Record<string, string[]> = {
      AUTH: ["LOGIN", "LOGOUT", "LOGIN_FAILED", "TOKEN_REFRESH"],
      CRUD: ["CREATE", "READ", "UPDATE", "DELETE"],
      CRON: ["CRON_START", "CRON_END", "CRON_FAILED"],
      SYSTEM: ["ERROR", "WARNING", "INFO"],
    };

    const validActions = categoryActionMap[category] || [];
    return allActions.filter(([key]) => validActions.includes(key));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* İlk satır: Arama ve hızlı filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Arama */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Kullanıcı, modül, hata ara..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>

        {/* Kategori */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as SystemLogCategory | "")}
          className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        >
          <option value="">Tüm Kategoriler</option>
          {categoryOptions.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Aksiyon */}
        <select
          value={action}
          onChange={(e) => onActionChange(e.target.value as SystemLogAction | "")}
          className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        >
          <option value="">Tüm Aksiyonlar</option>
          {getFilteredActions().map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Durum */}
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value as SystemLogStatus | "")}
          className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        >
          <option value="">Tüm Durumlar</option>
          {statusOptions.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Modül */}
        <select
          value={moduleName}
          onChange={(e) => onModuleChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
        >
          <option value="">Tüm Modüller</option>
          {modules.map((mod) => (
            <option key={mod} value={mod}>
              {mod}
            </option>
          ))}
        </select>
      </div>

      {/* İkinci satır: Tarih filtreleri */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-text-muted)]">Başlangıç:</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-text-muted)]">Bitiş:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </div>

        {/* Filtreleri temizle */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-3 h-3" />
            Filtreleri Temizle
          </button>
        )}
      </div>
    </div>
  );
}
