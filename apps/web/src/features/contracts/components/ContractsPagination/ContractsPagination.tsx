import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { PaginationMeta } from "../../types";
import { CONTRACTS_CONSTANTS } from "../../constants/contracts.constants";

interface ContractsPaginationProps {
  meta: PaginationMeta;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function ContractsPagination({
  meta,
  pageSize,
  onPageChange,
  onPageSizeChange
}: ContractsPaginationProps) {
  const { page, totalPages, total, hasNextPage, hasPrevPage } = meta;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
      {/* Items info */}
      <div className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{startItem.toLocaleString("tr-TR")}</span>
        {" - "}
        <span className="font-medium text-foreground">{endItem.toLocaleString("tr-TR")}</span>
        {" / "}
        <span className="font-medium text-foreground">{total.toLocaleString("tr-TR")}</span>
        {" kayıt"}
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sayfa başına:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {CONTRACTS_CONSTANTS.PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="İlk sayfa"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="Önceki sayfa"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <span className="px-3 text-sm text-muted-foreground">
          Sayfa{" "}
          <span className="font-medium text-foreground">{page}</span>
          {" / "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="Sonraki sayfa"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
          title="Son sayfa"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
