import { useState, useRef, useCallback, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import type { Sale } from "../../types/sale.types";
import { SaleCard } from "./SaleCard";

interface SaleMobileListProps {
  data: Sale[];
  loading: boolean;
  onRowDoubleClick?: (item: Sale) => void;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

const INITIAL_ITEMS = 20;
const LOAD_MORE_COUNT = 20;

export function SaleMobileList({
  data,
  loading,
  onRowDoubleClick,
  onScrollDirectionChange,
}: SaleMobileListProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  // Reset visible count when data changes
  useEffect(() => {
    setVisibleCount(INITIAL_ITEMS);
  }, [data]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentScrollTop = el.scrollTop;
    const isAtTop = currentScrollTop <= 10;
    const direction = currentScrollTop > lastScrollTop.current ? "down" : "up";
    lastScrollTop.current = currentScrollTop;

    onScrollDirectionChange?.(direction, isAtTop);
  }, [onScrollDirectionChange]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, data.length));
  }, [data.length]);

  const visibleData = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          Yükleniyor...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCart className="h-12 w-12 text-[var(--color-muted-foreground)] mb-3" />
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Satış bulunamadı
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      <div className="flex flex-col gap-2 p-2">
        {visibleData.map((sale) => (
          <SaleCard
            key={sale._id}
            sale={sale}
            onClick={() => onRowDoubleClick?.(sale)}
          />
        ))}

        {hasMore && (
          <button
            onClick={handleLoadMore}
            className="mt-2 py-3 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            Daha fazla göster ({data.length - visibleCount} kaldı)
          </button>
        )}
      </div>
    </div>
  );
}
