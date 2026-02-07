import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualizationOptions {
  rowCount: number;
  rowHeight: number;
  overscan?: number;
}

export function useVirtualization({
  rowCount,
  rowHeight,
  overscan = 10,
}: UseVirtualizationOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return {
    scrollContainerRef,
    rowVirtualizer,
    totalHeight: rowVirtualizer.getTotalSize(),
    virtualRows: rowVirtualizer.getVirtualItems(),
  };
}
