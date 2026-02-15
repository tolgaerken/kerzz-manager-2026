import { useCallback, useMemo } from "react";
import {
  Grid,
  type GridColumnDef,
  type ToolbarConfig,
  type ToolbarButtonConfig
} from "@kerzz/grid";
import { Chip } from "@mui/material";

export interface Column<T> {
  field: keyof T | string;
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  align?: "left" | "center" | "right";
  renderCell?: (row: T) => React.ReactNode;
  valueGetter?: (row: T) => string | number | boolean | null | undefined;
  sortable?: boolean;
  filterable?: boolean;
}

interface SsoDataGridProps<T> {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  getRowId?: (row: T) => string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  emptyMessage?: string;
  showActions?: boolean;
  selectedId?: string | null;
  stateKey?: string;
  height?: string | number;
  toolbarButtons?: ToolbarButtonConfig[];
  exportFileName?: string;
}

export function SsoDataGrid<T extends { id?: string }>({
  rows,
  columns,
  loading = false,
  getRowId = (row) => row.id || "",
  onEdit,
  onDelete,
  onView,
  onRowClick,
  onRowDoubleClick,
  stateKey,
  height = 500,
  toolbarButtons,
  exportFileName
}: SsoDataGridProps<T>) {
  // Convert columns to kerzz-grid format
  const gridColumns: GridColumnDef<T>[] = useMemo(() => {
    const cols: GridColumnDef<T>[] = columns.map((col) => {
      const gridCol: GridColumnDef<T> = {
        id: col.field as string,
        header: col.headerName,
        accessorKey: col.field as keyof T & string,
        width: col.width || col.minWidth || 150,
        sortable: col.sortable !== false,
        resizable: true,
        align: col.align || "left"
      };

      // Custom cell renderer
      if (col.renderCell) {
        gridCol.cell = (_, row) => col.renderCell!(row);
      } else if (col.valueGetter) {
        gridCol.cell = (_, row) => {
          const value = col.valueGetter!(row);
          if (typeof value === "boolean") {
            return (
              <Chip
                label={value ? "Aktif" : "Pasif"}
                size="small"
                sx={value ? {
                  bgcolor: "var(--color-success)",
                  color: "var(--color-success-foreground)"
                } : {
                  bgcolor: "var(--color-surface-hover)",
                  color: "var(--color-muted-foreground)"
                }}
              />
            );
          }
          return value;
        };
      } else if (col.field === "isActive") {
        gridCol.cell = (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            size="small"
            sx={value ? {
              bgcolor: "var(--color-success)",
              color: "var(--color-success-foreground)"
            } : {
              bgcolor: "var(--color-surface-hover)",
              color: "var(--color-muted-foreground)"
            }}
          />
        );
      }

      // Add filter for text columns
      if (col.filterable !== false) {
        gridCol.filter = { type: "input", conditions: ["contains", "startsWith", "equals"] };
      }

      return gridCol;
    });

    // Add actions column if needed
    const hasActions = onEdit || onDelete || onView;
    if (hasActions) {
      cols.push({
        id: "_actions",
        header: "İşlemler",
        accessorKey: "id",
        width: 120,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            {onView && (
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(row);
                }}
                title="Görüntüle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-muted-foreground)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
                title="Düzenle"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="p-1.5 rounded hover:bg-[var(--color-error)]/10 text-[var(--color-error)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row);
                }}
                title="Sil"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
              </button>
            )}
          </div>
        )
      });
    }

    return cols;
  }, [columns, onEdit, onDelete, onView]);

  // Handle row click
  const handleRowClick = useCallback(
    (row: T) => {
      onRowClick?.(row);
    },
    [onRowClick]
  );

  // Handle row double click
  const handleRowDoubleClick = useCallback(
    (row: T) => {
      if (onRowDoubleClick) {
        onRowDoubleClick(row);
      } else if (onEdit) {
        onEdit(row);
      }
    },
    [onRowDoubleClick, onEdit]
  );

  // Toolbar configuration
  const toolbarConfig: ToolbarConfig<T> = useMemo(
    () => ({
      customButtons: toolbarButtons,
      exportFileName: exportFileName || "sso-data"
    }),
    [toolbarButtons, exportFileName]
  );

  return (
    <div style={{ height: typeof height === "number" ? `${height}px` : height }}>
      <Grid<T>
        data={rows}
        columns={gridColumns}
        loading={loading}
        height="100%"
        locale="tr"
        stateKey={stateKey}
        getRowId={getRowId}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={toolbarConfig}
      />
    </div>
  );
}

export default SsoDataGrid;
