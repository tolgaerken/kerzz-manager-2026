import React, { useCallback, useMemo } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { ColumnStickyMeta } from '../../core/useGridInstance';
import type { CellEditorProps, SelectEditorOption, NavigationDirection } from '../../types/editing.types';
import { TextEditor } from '../Editors/TextEditor';
import { NumberEditor } from '../Editors/NumberEditor';
import { SelectEditor } from '../Editors/SelectEditor';
import { BooleanEditor } from '../Editors/BooleanEditor';

interface GridCellProps<TData> {
  column: GridColumnDef<TData>;
  row: TData;
  rowIndex: number;
  width: number;
  value: unknown;
  /** Sticky metadata for pinned columns */
  stickyMeta?: ColumnStickyMeta;
  isEditing?: boolean;
  /** Whether the grid is in batch edit mode */
  editMode?: boolean;
  /** Pending value for this cell (undefined if no pending change) */
  pendingValue?: unknown;
  /** Whether this cell has a pending change */
  hasPendingChange?: boolean;
  onStartEditing?: (rowIndex: number, columnId: string) => void;
  onSave?: (newValue: unknown) => void;
  onCancel?: () => void;
  /** Save value and navigate to next editable cell */
  onSaveAndMoveNext?: (newValue: unknown, direction: NavigationDirection) => void;
  context?: Record<string, unknown>;
}

function resolveAlign(
  explicitAlign: 'left' | 'center' | 'right' | undefined,
  value: unknown,
): string {
  if (explicitAlign) return explicitAlign;
  if (typeof value === 'number') return 'right';
  return '';
}

function resolveEditable<TData>(column: GridColumnDef<TData>, row: TData): boolean {
  if (typeof column.editable === 'function') return column.editable(row);
  return column.editable === true;
}

function GridCellInner<TData>({
  column,
  row,
  rowIndex,
  width,
  value,
  stickyMeta,
  isEditing,
  editMode,
  pendingValue,
  hasPendingChange,
  onStartEditing,
  onSave,
  onCancel,
  onSaveAndMoveNext,
  context,
}: GridCellProps<TData>) {
  // Use pending value for display when available
  const displayValue = hasPendingChange ? pendingValue : value;

  const align = resolveAlign(column.align, displayValue);
  const alignClass = align ? `kz-grid-cell--align-${align}` : '';
  const editable = resolveEditable(column, row);

  const className =
    typeof column.cellClassName === 'function'
      ? column.cellClassName(displayValue, row)
      : column.cellClassName ?? '';

  // Sticky styles for pinned columns
  const stickyStyle: React.CSSProperties = {};
  if (stickyMeta?.pinnedSide === 'left') {
    stickyStyle.position = 'sticky';
    stickyStyle.left = stickyMeta.stickyOffset;
    stickyStyle.zIndex = 1;
  } else if (stickyMeta?.pinnedSide === 'right') {
    stickyStyle.position = 'sticky';
    stickyStyle.right = stickyMeta.stickyOffset;
    stickyStyle.zIndex = 1;
  }

  // Pinned class names
  const pinnedClasses = [
    stickyMeta?.pinnedSide === 'left' && 'kz-grid-cell--pinned-left',
    stickyMeta?.pinnedSide === 'right' && 'kz-grid-cell--pinned-right',
    stickyMeta?.isLastLeftPinned && 'kz-grid-cell--last-left-pinned',
    stickyMeta?.isFirstRightPinned && 'kz-grid-cell--first-right-pinned',
  ].filter(Boolean).join(' ');

  // Double-click: always starts editing (entry point for edit mode)
  const handleDoubleClick = useCallback(() => {
    if (editable && onStartEditing) {
      onStartEditing(rowIndex, column.id);
    }
  }, [editable, onStartEditing, rowIndex, column.id]);

  // Single-click: starts editing only when in edit mode
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (editMode && editable && onStartEditing) {
        e.stopPropagation();
        onStartEditing(rowIndex, column.id);
      }
    },
    [editMode, editable, onStartEditing, rowIndex, column.id],
  );

  // Resolve options for select editor
  const resolvedOptions = useMemo((): SelectEditorOption[] => {
    if (!column.cellEditor) return [];
    const opts = column.cellEditor.options;
    if (typeof opts === 'function') return opts(row, context);
    return opts ?? [];
  }, [column.cellEditor, row, context]);

  // Render editor
  if (isEditing && editable && column.cellEditor) {
    const editorType = column.cellEditor.type;

    // Pass pending value to editor if available, otherwise original value
    const editorValue = hasPendingChange ? pendingValue : value;

    const baseProps: CellEditorProps<TData> = {
      value: editorValue,
      row,
      column,
      onSave: onSave ?? (() => {}),
      onCancel: onCancel ?? (() => {}),
      onSaveAndMoveNext,
      context,
    };

    let editor: React.ReactNode = null;

    switch (editorType) {
      case 'text':
        editor = <TextEditor {...baseProps} />;
        break;
      case 'number':
        editor = <NumberEditor {...baseProps} />;
        break;
      case 'select':
        editor = <SelectEditor {...baseProps} options={resolvedOptions} />;
        break;
      case 'boolean':
        editor = <BooleanEditor {...baseProps} />;
        break;
      case 'custom': {
        const CustomEditor = column.cellEditor.customEditor;
        if (CustomEditor) {
          editor = <CustomEditor {...baseProps} />;
        }
        break;
      }
    }

    return (
      <div
        className={`kz-grid-cell kz-grid-cell--editing ${alignClass} ${pinnedClasses} ${className}`.trim()}
        style={{
          width,
          minWidth: column.minWidth ?? 50,
          maxWidth: width,
          flexBasis: width,
          flexGrow: 0,
          flexShrink: 0,
          ...stickyStyle,
        }}
      >
        {editor}
      </div>
    );
  }

  // Display mode: use cell renderer, valueFormatter, or raw value
  const content = column.cell
    ? column.cell(displayValue, row, context)
    : column.valueFormatter
      ? column.valueFormatter(displayValue, row)
      : displayValue != null
        ? String(displayValue)
        : '';

  const cellClasses = [
    'kz-grid-cell',
    editable && 'kz-grid-cell--editable',
    hasPendingChange && 'kz-grid-cell--changed',
    alignClass,
    pinnedClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cellClasses}
      style={{
        width,
        minWidth: column.minWidth ?? 50,
        maxWidth: width,
        flexBasis: width,
        flexGrow: 0,
        flexShrink: 0,
        ...stickyStyle,
      }}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <span className="kz-grid-cell__content">{content}</span>
    </div>
  );
}

export const GridCell = React.memo(GridCellInner) as typeof GridCellInner;
