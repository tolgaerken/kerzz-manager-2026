import { ChevronLeft, ChevronRight } from "lucide-react";
import { SYSTEM_LOGS_CONSTANTS } from "../../constants/system-logs.constants";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SystemLogsPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function SystemLogsPagination({
  pagination,
  onPageChange,
  onLimitChange,
}: SystemLogsPaginationProps) {
  const { page, limit, total, totalPages } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)]">
      {/* Sol: Bilgi */}
      <div className="text-sm text-[var(--color-text-muted)]">
        {total > 0
          ? `${startItem.toLocaleString("tr-TR")}-${endItem.toLocaleString("tr-TR")} / ${total.toLocaleString("tr-TR")} kayıt`
          : "Kayıt bulunamadı"}
      </div>

      {/* Orta: Sayfa boyutu */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[var(--color-text-muted)]">Sayfa:</label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-2 py-1 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none"
        >
          {SYSTEM_LOGS_CONSTANTS.PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Sağ: Sayfalama butonları */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-[var(--color-foreground)]" />
        </button>
        <span className="px-3 text-sm text-[var(--color-foreground)]">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-[var(--color-foreground)]" />
        </button>
      </div>
    </div>
  );
}
