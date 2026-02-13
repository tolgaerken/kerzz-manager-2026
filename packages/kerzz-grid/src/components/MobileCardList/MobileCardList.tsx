import React, { useRef, useCallback, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { MobileCardRenderProps } from '../../types/grid.types';
import type { SelectionMode } from '../../types/selection.types';
import { useLocale } from '../../i18n/useLocale';

const SCROLL_THRESHOLD = 4;
const DEFAULT_CARD_HEIGHT = 120;
const OVERSCAN = 5;

interface MobileCardListProps<TData> {
  /** Data array to display */
  data: TData[];
  /** Card renderer function */
  cardRenderer: (props: MobileCardRenderProps<TData>) => React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Function to get unique row ID */
  getRowId: (row: TData) => string;
  /** Estimated card height for virtual scroll */
  estimatedCardHeight?: number;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Check if a row is selected */
  isRowSelected: (rowId: string) => boolean;
  /** Toggle row selection */
  onSelectionToggle: (rowId: string, shiftKey: boolean) => void;
  /** Selection mode */
  selectionMode: SelectionMode;
  /** Row click handler */
  onRowClick?: (row: TData, index: number) => void;
  /** Row double click handler */
  onRowDoubleClick?: (row: TData, index: number) => void;
  /** Scroll direction change callback */
  onScrollDirectionChange?: (direction: 'up' | 'down' | null, isAtTop: boolean) => void;
  /** Number of selected items */
  selectedCount: number;
  /** Total count of items */
  totalCount: number;
}

function MobileCardListInner<TData>({
  data,
  cardRenderer,
  loading = false,
  getRowId,
  estimatedCardHeight = DEFAULT_CARD_HEIGHT,
  emptyMessage,
  isRowSelected,
  onSelectionToggle,
  selectionMode,
  onRowClick,
  onRowDoubleClick,
  onScrollDirectionChange,
  selectedCount,
  totalCount,
}: MobileCardListProps<TData>) {
  const locale = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Virtual scroll setup
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => estimatedCardHeight,
    overscan: OVERSCAN,
  });

  // Scroll direction detection
  const handleScroll = useCallback(() => {
    if (!onScrollDirectionChange || !scrollContainerRef.current) return;

    const currentScrollTop = scrollContainerRef.current.scrollTop;
    const isAtTop = currentScrollTop <= 2;
    const scrollDiff = currentScrollTop - lastScrollTopRef.current;

    if (isAtTop) {
      onScrollDirectionChange('up', true);
      lastScrollTopRef.current = 0;
      return;
    }

    if (Math.abs(scrollDiff) >= SCROLL_THRESHOLD) {
      onScrollDirectionChange(scrollDiff > 0 ? 'down' : 'up', false);
      lastScrollTopRef.current = currentScrollTop;
    }
  }, [onScrollDirectionChange]);

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className="kz-mobile-card-list kz-mobile-card-list--loading">
        <div className="kz-grid-loading__spinner" />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="kz-mobile-card-list kz-mobile-card-list--empty">
        <p className="kz-mobile-card-list__empty-text">
          {emptyMessage || locale.noData}
        </p>
      </div>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="kz-mobile-card-list">
      {/* Sticky count indicator */}
      <div className="kz-mobile-card-list__count">
        <span>
          {totalCount} {locale.mobileCardListRecords || 'kayıt'}
          {selectedCount > 0 && (
            <span className="kz-mobile-card-list__count-selected">
              {' '}({selectedCount} {locale.mobileCardListSelected || 'seçili'})
            </span>
          )}
        </span>
      </div>

      {/* Virtual scroll container */}
      <div
        ref={scrollContainerRef}
        className="kz-mobile-card-list__scroll"
        onScroll={handleScroll}
      >
        <div
          className="kz-mobile-card-list__inner"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualItem) => {
            const item = data[virtualItem.index];
            if (!item) return null;

            const rowId = getRowId(item);
            const isSelected = isRowSelected(rowId);

            const handleSelect = () => {
              if (selectionMode !== 'none') {
                onSelectionToggle(rowId, false);
              }
            };

            const handleTap = () => {
              onRowClick?.(item, virtualItem.index);
            };

            const handleDoubleTap = () => {
              onRowDoubleClick?.(item, virtualItem.index);
            };

            return (
              <div
                key={rowId}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="kz-mobile-card-list__item"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {cardRenderer({
                  item,
                  index: virtualItem.index,
                  isSelected,
                  onSelect: handleSelect,
                  onTap: handleTap,
                  onDoubleTap: handleDoubleTap,
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const MobileCardList = memo(MobileCardListInner) as typeof MobileCardListInner;
