import { useState, useCallback, useRef } from 'react';

interface UseColumnDragOptions {
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
}

export interface UseColumnDragReturn {
  dragColumnId: string | null;
  dropTargetId: string | null;
  handleDragStart: (columnId: string, e: React.DragEvent) => void;
  handleDragOver: (columnId: string, e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (columnId: string, e: React.DragEvent) => void;
  handleDragEnd: () => void;
}

export function useColumnDrag({
  columnOrder,
  onColumnOrderChange,
}: UseColumnDragOptions): UseColumnDragReturn {
  const [dragColumnId, setDragColumnId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const orderRef = useRef(columnOrder);
  orderRef.current = columnOrder;

  const handleDragStart = useCallback(
    (columnId: string, e: React.DragEvent) => {
      setDragColumnId(columnId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', columnId);

      // Create a minimal drag image
      const el = e.currentTarget as HTMLElement;
      if (el) {
        e.dataTransfer.setDragImage(el, 20, 20);
      }
    },
    [],
  );

  const handleDragOver = useCallback(
    (columnId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (columnId !== dragColumnId) {
        setDropTargetId(columnId);
      }
    },
    [dragColumnId],
  );

  const handleDragLeave = useCallback(() => {
    setDropTargetId(null);
  }, []);

  const handleDrop = useCallback(
    (targetColumnId: string, e: React.DragEvent) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain') || dragColumnId;

      if (!sourceId || sourceId === targetColumnId) {
        setDragColumnId(null);
        setDropTargetId(null);
        return;
      }

      const order = [...orderRef.current];
      const sourceIndex = order.indexOf(sourceId);
      const targetIndex = order.indexOf(targetColumnId);

      if (sourceIndex === -1 || targetIndex === -1) {
        setDragColumnId(null);
        setDropTargetId(null);
        return;
      }

      // Remove source and insert at target position
      order.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;
      order.splice(adjustedTargetIndex, 0, sourceId);
      onColumnOrderChange(order);

      setDragColumnId(null);
      setDropTargetId(null);
    },
    [dragColumnId, onColumnOrderChange],
  );

  const handleDragEnd = useCallback(() => {
    setDragColumnId(null);
    setDropTargetId(null);
  }, []);

  return {
    dragColumnId,
    dropTargetId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
