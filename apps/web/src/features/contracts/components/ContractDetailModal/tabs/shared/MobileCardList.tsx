import { memo, type ReactNode } from "react";
import { Loader2, Plus } from "lucide-react";

interface MobileCardListProps<T> {
  data: T[];
  loading: boolean;
  renderCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
}

function MobileCardListInner<T>({
  data,
  loading,
  renderCard,
  emptyMessage = "Kayıt bulunamadı",
  onAddNew,
  addNewLabel = "Yeni Ekle"
}: MobileCardListProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Add button */}
      {onAddNew && (
        <div className="shrink-0 pb-3">
          <button
            onClick={onAddNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] text-sm font-medium text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            {addNewLabel}
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="flex-1 overflow-y-auto">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-2">
            {data.map((item, index) => renderCard(item, index))}
          </div>
        )}
      </div>
    </div>
  );
}

export const MobileCardList = memo(MobileCardListInner) as typeof MobileCardListInner;
