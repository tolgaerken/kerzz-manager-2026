import React, { useCallback, useMemo } from 'react';
import type { GridColumnDef } from '../../types/column.types';
import type { CellEditorProps, SelectEditorOption } from '../../types/editing.types';
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
  isEditing?: boolean;
  onStartEditing?: (rowIndex: number, columnId: string) => void;
  onSave?: (newValue: unknown) => void;
  onCancel?: () => void;
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
  isEditing,
  onStartEditing,
  onSave,
  onCancel,
  context,
}: GridCellProps<TData>) {
  const align = resolveAlign(column.align, value);
  const alignClass = align ? `kz-grid-cell--align-${align}` : '';
  const editable = resolveEditable(column, row);

  const className =
    typeof column.cellClassName === 'function'
      ? column.cellClassName(value, row)
      : column.cellClassName ?? '';

  const handleDoubleClick = useCallback(() => {
    if (editable && onStartEditing) {
      onStartEditing(rowIndex, column.id);
    }
  }, [editable, onStartEditing, rowIndex, column.id]);

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

    const baseProps: CellEditorProps<TData> = {
      value,
      row,
      column,
      onSave: onSave ?? (() => {}),
      onCancel: onCancel ?? (() => {}),
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
        className={`kz-grid-cell kz-grid-cell--editing ${alignClass} ${className}`.trim()}
        style={{ width, minWidth: column.minWidth ?? 50 }}
      >
        {editor}
      </div>
    );
  }

  // Display mode: use cell renderer, valueFormatter, or raw value
  const content = column.cell
    ? column.cell(value, row, context)
    : column.valueFormatter
      ? column.valueFormatter(value, row)
      : value != null
        ? String(value)
        : '';

  return (
    <div
      className={`kz-grid-cell ${editable ? 'kz-grid-cell--editable' : ''} ${alignClass} ${className}`.trim()}
      style={{ width, minWidth: column.minWidth ?? 50 }}
      onDoubleClick={handleDoubleClick}
    >
      <span className="kz-grid-cell__content">{content}</span>
    </div>
  );
}

export const GridCell = React.memo(GridCellInner) as typeof GridCellInner;
