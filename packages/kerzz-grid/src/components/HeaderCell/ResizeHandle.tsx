import React, { useCallback } from 'react';

interface ResizeHandleProps {
  columnId: string;
  onResizeStart: (columnId: string, e: React.MouseEvent | React.TouchEvent) => void;
  className?: string;
}

export const ResizeHandle = React.memo(function ResizeHandle({
  columnId,
  onResizeStart,
  className = 'kz-resize-handle',
}: ResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      onResizeStart(columnId, e);
    },
    [columnId, onResizeStart],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onResizeStart(columnId, e);
    },
    [columnId, onResizeStart],
  );

  return (
    <div
      className={className}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation="vertical"
    />
  );
});
