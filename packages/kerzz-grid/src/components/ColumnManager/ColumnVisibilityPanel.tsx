import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import { useLocale } from '../../i18n/useLocale';

interface ColumnVisibilityPanelProps {
  columns: GridColumnDef[];
  visibility: Record<string, boolean>;
  onToggle: (columnId: string) => void;
  onShowAll: (ids: string[]) => void;
  onHideAll: (ids: string[]) => void;
  onClose: () => void;
}

export const ColumnVisibilityPanel = React.memo(function ColumnVisibilityPanel({
  columns,
  visibility,
  onToggle,
  onShowAll,
  onHideAll,
  onClose,
}: ColumnVisibilityPanelProps) {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  const hideableColumns = useMemo(
    () => columns.filter((c) => c.hideable !== false),
    [columns],
  );

  const hideableIds = useMemo(
    () => hideableColumns.map((c) => c.id),
    [hideableColumns],
  );

  const handleShowAll = useCallback(() => {
    onShowAll(hideableIds);
  }, [onShowAll, hideableIds]);

  const handleHideAll = useCallback(() => {
    onHideAll(hideableIds);
  }, [onHideAll, hideableIds]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="kz-column-visibility" ref={panelRef}>
      <div className="kz-column-visibility__header">
        <span>{locale.columnVisibility}</span>
        <span style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="kz-filter-dropdown__action-btn"
            onClick={handleShowAll}
          >
            {locale.columnShowAll}
          </button>
          <button
            type="button"
            className="kz-filter-dropdown__action-btn"
            onClick={handleHideAll}
          >
            {locale.columnHideAll}
          </button>
        </span>
      </div>
      <div className="kz-column-visibility__list">
        {hideableColumns.map((col) => (
          <label key={col.id} className="kz-column-visibility__item">
            <input
              type="checkbox"
              checked={visibility[col.id] !== false}
              onChange={() => onToggle(col.id)}
            />
            <span>{col.header}</span>
          </label>
        ))}
      </div>
    </div>
  );
});
