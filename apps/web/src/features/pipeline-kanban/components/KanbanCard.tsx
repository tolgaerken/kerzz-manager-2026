import type { KanbanItem } from "../types/kanban.types";

interface KanbanCardProps {
  item: KanbanItem;
  onDragStart: (item: KanbanItem) => void;
  onDragEnd: () => void;
}

function formatCurrency(value?: number) {
  if (!value) return "-";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function KanbanCard({ item, onDragStart, onDragEnd }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(item)}
      onDragEnd={onDragEnd}
      className="rounded-lg border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{item.title}</p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
          )}
        </div>
        <span className="rounded-full bg-[var(--color-surface-elevated)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted-foreground)]">
          {item.entityType.toUpperCase()}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{item.status}</span>
        <span className="font-medium text-foreground">
          {formatCurrency(item.value)}
        </span>
      </div>
    </div>
  );
}
