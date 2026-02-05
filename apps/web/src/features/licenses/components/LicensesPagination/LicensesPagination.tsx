import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { LICENSES_CONSTANTS } from "../../constants/licenses.constants";
import type { PaginationInfo } from "../../types";

interface LicensesPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function LicensesPagination({
  pagination,
  onPageChange,
  onLimitChange
}: LicensesPaginationProps) {
  const { page, limit, total, totalPages } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Sol - Sayfa boyutu */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--color-foreground-muted)]">Sayfa başına:</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
        >
          {LICENSES_CONSTANTS.PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Orta - Bilgi */}
      <div className="text-sm text-[var(--color-foreground-muted)]">
        {total > 0 ? (
          <>
            <span className="font-medium text-[var(--color-foreground)]">{startItem}</span>
            {" - "}
            <span className="font-medium text-[var(--color-foreground)]">{endItem}</span>
            {" / "}
            <span className="font-medium text-[var(--color-foreground)]">{total}</span>
            {" kayıt"}
          </>
        ) : (
          "Kayıt bulunamadı"
        )}
      </div>

      {/* Sağ - Navigasyon */}
      <div className="flex items-center gap-1">
        {/* İlk sayfa */}
        <button
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="İlk sayfa"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Önceki sayfa */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Önceki sayfa"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Sayfa numarası */}
        <span className="px-3 py-1 text-sm">
          <span className="font-medium">{page}</span>
          <span className="text-[var(--color-foreground-muted)]"> / {totalPages || 1}</span>
        </span>

        {/* Sonraki sayfa */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Sonraki sayfa"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Son sayfa */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Son sayfa"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
