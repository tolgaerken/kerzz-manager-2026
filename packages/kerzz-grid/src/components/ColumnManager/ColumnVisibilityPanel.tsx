import React, { useEffect, useRef } from 'react';
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

export function ColumnVisibilityPanel({
  columns,
  visibility,
  onToggle,
  onShowAll,
  onHideAll,
  onClose,
}: ColumnVisibilityPanelProps) {
  const locale = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);
  const hideableColumns = columns.filter((c) => c.hideable !== false);
  const hideableIds = hideableColumns.map((c) => c.id);

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
            onClick={() => onShowAll(hideableIds)}
          >
            {locale.columnShowAll}
          </button>
          <button
            type="button"
            className="kz-filter-dropdown__action-btn"
            onClick={() => onHideAll(hideableIds)}
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
}
