import { memo, useState, useMemo, useRef, useEffect, useCallback, type UIEvent } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { LeadCard } from "./LeadCard";
import type { Lead } from "../../types/lead.types";

const PAGE_SIZE = 20;
const SCROLL_THRESHOLD = 10;

interface LeadMobileListProps {
  data: Lead[];
  loading: boolean;
  onCardClick: (lead: Lead) => void;
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
}

export const LeadMobileList = memo(function LeadMobileList({
  data,
  loading,
  onCardClick,
  onScrollDirectionChange
}: LeadMobileListProps) {
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

  // Data değiştiğinde visibleCount'u sıfırla
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [data]);

  const handleScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (!onScrollDirectionChange) return;

    const target = event.currentTarget;
    const currentScrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    const isAtTop = currentScrollTop <= 2;
    const isAtBottom = currentScrollTop + clientHeight >= scrollHeight - 10;
    const scrollDiff = currentScrollTop - lastScrollTopRef.current;

    // En üstteyken panel açık kalsın
    if (isAtTop) {
      onScrollDirectionChange("up", true);
      lastScrollTopRef.current = 0;
      return;
    }

    // En altta veya en alta yakınken kararsızlığı önle - mevcut durumu koru
    if (isAtBottom) {
      lastScrollTopRef.current = currentScrollTop;
      return;
    }

    // Orta bölgede scroll yaparken yön değişimlerini tetikle
    if (Math.abs(scrollDiff) >= SCROLL_THRESHOLD) {
      onScrollDirectionChange(scrollDiff > 0 ? "down" : "up", false);
      lastScrollTopRef.current = currentScrollTop;
    }
  }, [onScrollDirectionChange]);

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
        <p className="text-sm text-[var(--color-muted-foreground)]">Lead bulunamadı</p>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-2 pb-2">
      {/* Count indicator */}
      <div className="sticky top-0 z-10 mb-2 rounded-md bg-[var(--color-surface)] px-2 py-1.5">
        <p className="text-xs text-[var(--color-muted-foreground)] text-center">
          {visibleData.length} / {data.length} lead gösteriliyor
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {visibleData.map((lead) => (
          <LeadCard
            key={lead._id}
            lead={lead}
            onClick={onCardClick}
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
