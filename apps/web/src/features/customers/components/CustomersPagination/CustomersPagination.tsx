import { ChevronLeft, ChevronRight } from "lucide-react";
import { CUSTOMERS_CONSTANTS } from "../../constants/customers.constants";

interface CustomersPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function CustomersPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange
}: CustomersPaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
      {/* Info */}
      <div className="text-sm text-[var(--color-foreground-muted)]">
        {total > 0 ? (
          <>
            <span className="font-medium">{startItem}</span>
            {" - "}
            <span className="font-medium">{endItem}</span>
            {" / "}
            <span className="font-medium">{total}</span>
            {" kayıt"}
          </>
        ) : (
          "Kayıt bulunamadı"
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-foreground-muted)]">
            Sayfa başına:
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {CUSTOMERS_CONSTANTS.PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--color-foreground)]" />
          </button>

          <span className="px-3 text-sm text-[var(--color-foreground)]">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[var(--color-foreground)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
