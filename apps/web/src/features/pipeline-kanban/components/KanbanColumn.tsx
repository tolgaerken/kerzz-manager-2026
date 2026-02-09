import type { KanbanColumnConfig } from "../constants/kanban.constants";
import type { KanbanItem } from "../types/kanban.types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: KanbanColumnConfig;
  items: KanbanItem[];
  isDropAllowed: boolean;
  onDrop: () => void;
  onDragStart: (item: KanbanItem) => void;
  onDragEnd: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function KanbanColumn({
  column,
  items,
  isDropAllowed,
  onDrop,
  onDragStart,
  onDragEnd,
}: KanbanColumnProps) {
  const totalValue = items.reduce((sum, item) => sum + (item.value || 0), 0);
  const weightedValue = totalValue * column.weight;

  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-border bg-surface p-4 transition-colors ${
        isDropAllowed ? "ring-1 ring-[var(--color-primary)]/30" : ""
      }`}
      onDragOver={(event) => {
        if (isDropAllowed) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (isDropAllowed) onDrop();
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
          <p className="text-xs text-muted-foreground">
            {items.length} kayıt • {formatCurrency(totalValue)}
            {column.weight > 0 && (
              <span className="ml-2">
                Ağırlıklı: {formatCurrency(weightedValue)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-elevated p-4 text-center text-xs text-muted-foreground">
            Kayıt yok
          </div>
        ) : (
          items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
}
