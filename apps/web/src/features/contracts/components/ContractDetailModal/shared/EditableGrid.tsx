import { useState, useMemo, useCallback } from "react";
import { Grid, type GridColumnDef, type ToolbarButtonConfig, type ToolbarConfig } from "@kerzz/grid";
import { Loader2, Trash2 } from "lucide-react";

/** Prefix used to identify pending (unsaved) new rows */
const PENDING_ROW_PREFIX = "__new_";

let pendingRowCounter = 0;

interface EditableGridProps<T> {
  data: T[];
  columns: GridColumnDef<T>[];
  loading?: boolean;
  getRowId: (data: T) => string;
  onCellValueChange?: (row: T, columnId: string, newValue: unknown, oldValue: unknown) => void;
  onRowClick?: (row: T) => void;
  context?: Record<string, unknown>;
  height?: number | string;
  /** Factory function that creates a new empty row object (no API call) */
  createEmptyRow?: () => T;
  /** Called when Save is clicked — receives all pending new rows to be persisted */
  onSaveNewRows?: (rows: T[]) => void;
  /** Toolbar: sil butonu callback */
  onDelete?: () => void;
  /** Sil butonu aktif mi */
  canDelete?: boolean;
  /** İşlem devam ediyor mu (butonları disable eder) */
  processing?: boolean;
  /** Sil buton etiketi */
  deleteLabel?: string;

  // --- Backward-compatible props (deprecated, prefer createEmptyRow) ---
  /** @deprecated Use createEmptyRow instead */
  onAdd?: () => void;
  /** @deprecated Use deleteLabel */
  addLabel?: string;
}

export function EditableGrid<T>({
  data,
  columns,
  loading = false,
  getRowId,
  onCellValueChange,
  onRowClick,
  context,
  height,
  createEmptyRow,
  onSaveNewRows,
  onAdd,
  onDelete,
  canDelete = false,
  processing = false,
  deleteLabel = "Sil"
}: EditableGridProps<T>) {
  // Pending new rows that haven't been saved to the server yet
  const [pendingNewRows, setPendingNewRows] = useState<T[]>([]);

  // Whether we use the new deferred-save flow
  const useDeferredAdd = !!createEmptyRow;

  // Combined data: server data + pending new rows
  const mergedData = useMemo(
    () => (pendingNewRows.length > 0 ? [...data, ...pendingNewRows] : data),
    [data, pendingNewRows]
  );

  // Check if a row is a pending new row by its ID
  const isPendingRow = useCallback(
    (row: T): boolean => {
      const id = getRowId(row);
      return id.startsWith(PENDING_ROW_PREFIX);
    },
    [getRowId]
  );

  // Handle add row: create a temp row locally (no API call)
  const handleRowAdd = useCallback(() => {
    if (useDeferredAdd && createEmptyRow) {
      const emptyRow = createEmptyRow();
      // Assign a temp ID so the grid can identify it
      const tempId = `${PENDING_ROW_PREFIX}${++pendingRowCounter}`;
      const rowWithId = { ...emptyRow, id: tempId, _id: tempId } as T;
      setPendingNewRows((prev) => [...prev, rowWithId]);
    } else if (onAdd) {
      // Fallback: legacy immediate-create behavior
      onAdd();
    }
  }, [useDeferredAdd, createEmptyRow, onAdd]);

  // Intercept cell value changes: update pending rows locally, forward existing rows to parent
  const handleCellValueChange = useCallback(
    (row: T, columnId: string, newValue: unknown, oldValue: unknown) => {
      if (isPendingRow(row)) {
        // Update the pending row locally (don't call the API)
        const rowId = getRowId(row);
        setPendingNewRows((prev) =>
          prev.map((r) =>
            getRowId(r) === rowId ? { ...r, [columnId]: newValue } : r
          )
        );
      } else {
        // Forward to parent's handler for existing rows
        onCellValueChange?.(row, columnId, newValue, oldValue);
      }
    },
    [isPendingRow, getRowId, onCellValueChange]
  );

  // When Save is clicked: send pending new rows to parent for API persistence
  const handleEditSave = useCallback(() => {
    if (pendingNewRows.length > 0 && onSaveNewRows) {
      onSaveNewRows(pendingNewRows);
    }
    setPendingNewRows([]);
  }, [pendingNewRows, onSaveNewRows]);

  // When Cancel is clicked: discard all pending new rows
  const handleEditCancel = useCallback(() => {
    setPendingNewRows([]);
  }, []);

  // Toolbar config
  const showAddRow = useDeferredAdd || !!onAdd;

  const toolbarConfig = useMemo<ToolbarConfig<T>>(() => {
    const customButtons: ToolbarButtonConfig[] = [];

    if (onDelete) {
      customButtons.push({
        id: "delete",
        label: deleteLabel,
        icon: processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />,
        onClick: onDelete,
        disabled: !canDelete || processing,
        variant: "danger"
      });
    }

    return {
      showSearch: true,
      showExcelExport: true,
      showPdfExport: false,
      showColumnVisibility: true,
      showAddRow,
      customButtons
    };
  }, [showAddRow, onDelete, canDelete, processing, deleteLabel]);

  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-surface">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
      <Grid<T>
        data={mergedData}
        columns={columns}
        getRowId={getRowId}
        onCellValueChange={handleCellValueChange}
        onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
        onRowAdd={showAddRow ? handleRowAdd : undefined}
        onEditSave={handleEditSave}
        onEditCancel={handleEditCancel}
        context={context}
        height="100%"
        locale="tr"
        toolbar={toolbarConfig}
        selectionMode="single"
      />
    </div>
  );
}
