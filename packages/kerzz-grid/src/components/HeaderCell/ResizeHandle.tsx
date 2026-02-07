import React, { useCallback } from 'react';

interface ResizeHandleProps {
  columnId: string;
  onResizeStart: (columnId: string, e: React.MouseEvent | React.TouchEvent) => void;
}

export const ResizeHandle = React.memo(function ResizeHandle({
  columnId,
  onResizeStart,
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
      className="kz-resize-handle"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="separator"
      aria-orientation="vertical"
    />
  );
});
