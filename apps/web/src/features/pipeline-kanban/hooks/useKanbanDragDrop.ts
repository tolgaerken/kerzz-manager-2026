import { useCallback, useState } from "react";
import type { KanbanColumnConfig } from "../constants/kanban.constants";
import type { KanbanItem } from "../types/kanban.types";

interface UseKanbanDragDropProps {
  onMove: (item: KanbanItem, column: KanbanColumnConfig) => Promise<void> | void;
}

export function useKanbanDragDrop({ onMove }: UseKanbanDragDropProps) {
  const [draggingItem, setDraggingItem] = useState<KanbanItem | null>(null);

  const handleDragStart = useCallback((item: KanbanItem) => {
    setDraggingItem(item);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingItem(null);
  }, []);

  const canDrop = useCallback(
    (column: KanbanColumnConfig) =>
      !!draggingItem && draggingItem.entityType === column.entityType,
    [draggingItem]
  );

  const handleDrop = useCallback(
    async (column: KanbanColumnConfig) => {
      if (!draggingItem) return;
      if (!canDrop(column)) return;
      await onMove(draggingItem, column);
      setDraggingItem(null);
    },
    [draggingItem, canDrop, onMove]
  );

  return {
    draggingItem,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    canDrop,
  };
}
