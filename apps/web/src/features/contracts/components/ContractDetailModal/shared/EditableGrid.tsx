import { useMemo } from "react";
import { Grid, type GridColumnDef, type ToolbarButtonConfig, type ToolbarConfig } from "@kerzz/grid";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface EditableGridProps<T> {
  data: T[];
  columns: GridColumnDef<T>[];
  loading?: boolean;
  getRowId: (data: T) => string;
  onCellValueChange?: (row: T, columnId: string, newValue: unknown, oldValue: unknown) => void;
  onRowClick?: (row: T) => void;
  context?: Record<string, unknown>;
  height?: number | string;
  /** Toolbar: ekle butonu callback */
  onAdd?: () => void;
  /** Toolbar: sil butonu callback */
  onDelete?: () => void;
  /** Sil butonu aktif mi */
  canDelete?: boolean;
  /** İşlem devam ediyor mu (butonları disable eder) */
  processing?: boolean;
  /** Ekle buton etiketi */
  addLabel?: string;
  /** Sil buton etiketi */
  deleteLabel?: string;
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
  onAdd,
  onDelete,
  canDelete = false,
  processing = false,
  addLabel = "Ekle",
  deleteLabel = "Sil"
}: EditableGridProps<T>) {
  // Toolbar config with custom add/delete buttons
  const toolbarConfig = useMemo<ToolbarConfig<T>>(() => {
    const customButtons: ToolbarButtonConfig[] = [];

    if (onAdd) {
      customButtons.push({
        id: "add",
        label: addLabel,
        icon: processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />,
        onClick: onAdd,
        disabled: processing,
        variant: "primary"
      });
    }

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
      customButtons
    };
  }, [onAdd, onDelete, canDelete, processing, addLabel, deleteLabel]);

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
        data={data}
        columns={columns}
        getRowId={getRowId}
        onCellValueChange={onCellValueChange}
        onRowClick={onRowClick ? (row) => onRowClick(row) : undefined}
        context={context}
        height="100%"
        locale="tr"
        toolbar={toolbarConfig}
        selectionMode="single"
      />
    </div>
  );
}
