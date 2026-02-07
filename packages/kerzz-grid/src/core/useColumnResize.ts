import { useCallback, useRef } from 'react';

interface UseColumnResizeOptions {
  columnWidths: Record<string, number>;
  onColumnWidthChange: (columnId: string, width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function useColumnResize({
  columnWidths,
  onColumnWidthChange,
  minWidth = 50,
  maxWidth = 1000,
}: UseColumnResizeOptions) {
  const resizingRef = useRef<{
    columnId: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleResizeStart = useCallback(
    (columnId: string, e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX =
        'touches' in e ? e.touches[0].clientX : e.clientX;
      const startWidth = columnWidths[columnId] ?? 150;

      resizingRef.current = { columnId, startX: clientX, startWidth };

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!resizingRef.current) return;

        const currentX =
          'touches' in moveEvent
            ? moveEvent.touches[0].clientX
            : moveEvent.clientX;
        const diff = currentX - resizingRef.current.startX;
        const newWidth = Math.max(
          minWidth,
          Math.min(maxWidth, resizingRef.current.startWidth + diff),
        );

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          onColumnWidthChange(resizingRef.current!.columnId, newWidth);
        });
      };

      const handleEnd = () => {
        resizingRef.current = null;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [columnWidths, onColumnWidthChange, minWidth, maxWidth],
  );

  const getColumnWidth = useCallback(
    (columnId: string, defaultWidth: number = 150): number => {
      return columnWidths[columnId] ?? defaultWidth;
    },
    [columnWidths],
  );

  return {
    handleResizeStart,
    getColumnWidth,
  };
}
