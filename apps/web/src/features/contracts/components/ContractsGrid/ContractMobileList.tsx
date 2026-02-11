import { memo, useState, useMemo } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { ContractCard } from "./ContractCard";
import type { Contract } from "../../types";

const PAGE_SIZE = 20;

interface ContractMobileListProps {
  data: Contract[];
  loading: boolean;
  onCardClick: (contract: Contract) => void;
}

export const ContractMobileList = memo(function ContractMobileList({
  data,
  loading,
  onCardClick
}: ContractMobileListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Paginated data
  const visibleData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < data.length;
  const remainingCount = data.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, data.length));
  };

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
        <p className="text-sm text-[var(--color-muted-foreground)]">Kontrat bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 pb-3">
      {/* Count indicator */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)] py-2 mb-2 border-b border-[var(--color-border)]/50">
        <p className="text-xs text-[var(--color-muted-foreground)] text-center">
          {visibleData.length} / {data.length} kontrat gösteriliyor
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {visibleData.map((contract) => (
          <ContractCard
            key={contract._id}
            contract={contract}
            onClick={onCardClick}
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          className="w-full mt-4 py-3 flex items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
          Daha fazla göster ({remainingCount} kaldı)
        </button>
      )}
    </div>
  );
});
