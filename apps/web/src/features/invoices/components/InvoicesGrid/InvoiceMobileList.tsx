import { memo, useState, useMemo, useRef, useEffect, useCallback, type UIEvent } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { InvoiceCard } from "./InvoiceCard";
import type { Invoice } from "../../types";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 4;

interface InvoiceMobileListProps {
  data: Invoice[];
  loading: boolean;
  autoPaymentCustomerIds: Set<string>;
  pendingPaymentInvoiceNos: Set<string>;
  balanceMap: Map<string, number>;
  onCardClick: (invoice: Invoice) => void;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
  customButtons?: ToolbarButtonConfig[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export const InvoiceMobileList = memo(function InvoiceMobileList({
  data,
  loading,
  autoPaymentCustomerIds,
  pendingPaymentInvoiceNos,
  balanceMap,
  onCardClick,
  onScrollDirectionChange,
  customButtons = [],
  selectedIds = [],
  onSelectionChange
}: InvoiceMobileListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Paginated data
  const visibleData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < data.length;
  const remainingCount = data.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, data.length));
  };

  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    lastScrollTopRef.current = container.scrollTop;
  }, []);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (!onScrollDirectionChange) return;

    const currentScrollTop = event.currentTarget.scrollTop;
    const isAtTop = currentScrollTop <= 2;
    const scrollDiff = currentScrollTop - lastScrollTopRef.current;

    if (isAtTop) {
      onScrollDirectionChange("up", true);
      lastScrollTopRef.current = 0;
      return;
    }

    if (Math.abs(scrollDiff) >= SCROLL_THRESHOLD) {
      onScrollDirectionChange(scrollDiff > 0 ? "down" : "up", false);
      lastScrollTopRef.current = currentScrollTop;
    }
  }, [onScrollDirectionChange]);

  const handleCardClick = useCallback((invoice: Invoice) => {
    // Toggle selection
    const isSelected = selectedIds.includes(invoice._id);
    if (isSelected) {
      onSelectionChange?.(selectedIds.filter(id => id !== invoice._id));
    } else {
      onSelectionChange?.([...selectedIds, invoice._id]);
    }
    // Also trigger the original click handler
    onCardClick(invoice);
  }, [selectedIds, onSelectionChange, onCardClick]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-[var(--color-muted-foreground)]">Fatura bulunamadı</p>
      </div>
    );
  }

  // Filter visible (enabled) buttons
  const visibleButtons = customButtons.filter(btn => !btn.disabled);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Toolbar - sticky at top */}
      {visibleButtons.length > 0 && (
        <div className="sticky top-0 z-20 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-2 py-2">
          <div className="flex items-center gap-2">
            {visibleButtons.map((button) => (
              <button
                key={button.id}
                onClick={button.onClick}
                disabled={button.disabled}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  button.variant === "primary"
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90"
                    : "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {button.icon}
                <span className="truncate">{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-2 pb-2">
        {/* Count indicator */}
        <div className="sticky top-0 z-10 mb-2 mt-2 rounded-md bg-[var(--color-surface)] px-2 py-1.5">
          <p className="text-xs text-[var(--color-muted-foreground)] text-center">
            {selectedIds.length > 0 && `${selectedIds.length} seçili • `}
            {visibleData.length} / {data.length} fatura gösteriliyor
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-2">
          {visibleData.map((invoice) => {
            const hasAutoPayment = autoPaymentCustomerIds.has(invoice.customerId);
            const isPendingPayment = pendingPaymentInvoiceNos.has(invoice.invoiceNumber);
            const balance = invoice.erpId ? balanceMap.get(invoice.erpId) : undefined;
            const isSelected = selectedIds.includes(invoice._id);

            return (
              <div
                key={invoice._id}
                className={`relative ${
                  isSelected ? "ring-2 ring-[var(--color-primary)] rounded-lg" : ""
                }`}
              >
                <InvoiceCard
                  invoice={invoice}
                  onClick={handleCardClick}
                  hasAutoPayment={hasAutoPayment}
                  isPendingPayment={isPendingPayment}
                  balance={balance}
                />
              </div>
            );
          })}
        </div>

        {/* Load more button */}
        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <ChevronDown className="h-4 w-4" />
            Daha fazla göster ({remainingCount} kaldı)
          </button>
        )}
      </div>
    </div>
  );
});
