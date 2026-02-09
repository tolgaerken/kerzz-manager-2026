import type { KanbanColumnConfig } from "../constants/kanban.constants";
import type { KanbanItem } from "../types/kanban.types";
import { KanbanColumn } from "./KanbanColumn";
import { useKanbanDragDrop } from "../hooks/useKanbanDragDrop";

interface KanbanBoardProps {
  columns: KanbanColumnConfig[];
  itemsByColumn: Record<string, KanbanItem[]>;
  isLoading?: boolean;
  onMove: (item: KanbanItem, column: KanbanColumnConfig) => Promise<void> | void;
}

export function KanbanBoard({
  columns,
  itemsByColumn,
  isLoading,
  onMove,
}: KanbanBoardProps) {
  const { draggingItem, handleDragStart, handleDragEnd, handleDrop, canDrop } =
    useKanbanDragDrop({ onMove });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted">
        Kanban verileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {columns.map((column) => {
        const items = itemsByColumn[column.id] || [];
        const allowDrop = !!draggingItem && canDrop(column);
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            items={items}
            isDropAllowed={allowDrop}
            onDrop={() => handleDrop(column)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
}
