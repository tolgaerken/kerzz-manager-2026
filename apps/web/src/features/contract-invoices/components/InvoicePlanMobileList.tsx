import { memo, useState, useMemo, useRef, useCallback, type UIEvent } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { InvoicePlanCard } from "./InvoicePlanCard";
import type { EnrichedPaymentPlan } from "../types";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 4;

interface InvoicePlanMobileListProps {
  data: EnrichedPaymentPlan[];
  loading: boolean;
  selectedIds: string[];
  onCardClick: (plan: EnrichedPaymentPlan) => void;
  onSelectionChange: (ids: string[]) => void;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export const InvoicePlanMobileList = memo(function InvoicePlanMobileList({
  data,
  loading,
  selectedIds,
  onCardClick,
  onSelectionChange,
  onScrollDirectionChange
}: InvoicePlanMobileListProps) {
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

  // Selection handler
  const handleSelect = useCallback((plan: EnrichedPaymentPlan) => {
    const isSelected = selectedIds.includes(plan.id);
    if (isSelected) {
      onSelectionChange(selectedIds.filter((id) => id !== plan.id));
    } else {
      onSelectionChange([...selectedIds, plan.id]);
    }
  }, [selectedIds, onSelectionChange]);

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
        <p className="text-sm text-[var(--color-muted-foreground)]">Ödeme planı bulunamadı</p>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-2 pb-2">
      {/* Count indicator */}
      <div className="sticky top-0 z-10 mb-2 rounded-md bg-[var(--color-surface)] px-2 py-1.5">
        <p className="text-xs text-[var(--color-muted-foreground)] text-center">
          {visibleData.length} / {data.length} ödeme planı gösteriliyor
          {selectedIds.length > 0 && (
            <span className="ml-2 text-[var(--color-primary)]">
              ({selectedIds.length} seçili)
            </span>
          )}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {visibleData.map((plan) => (
          <InvoicePlanCard
            key={plan.id}
            plan={plan}
            onClick={onCardClick}
            selected={selectedIds.includes(plan.id)}
            onSelect={handleSelect}
          />
        ))}
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
  );
});
