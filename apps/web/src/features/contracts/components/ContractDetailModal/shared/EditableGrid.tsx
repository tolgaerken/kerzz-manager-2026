import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridReadyEvent,
  type CellValueChangedEvent,
  type SelectionChangedEvent,
  themeQuartz
} from "ag-grid-community";
import { Loader2 } from "lucide-react";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface EditableGridProps<T> {
  data: T[];
  columnDefs: ColDef<T>[];
  loading?: boolean;
  getRowId: (data: T) => string;
  onCellValueChanged?: (params: CellValueChangedEvent<T>) => void;
  onSelectionChanged?: (selectedRow: T | null) => void;
  context?: Record<string, unknown>;
  height?: string;
}

export function EditableGrid<T>({
  data,
  columnDefs,
  loading = false,
  getRowId,
  onCellValueChanged,
  onSelectionChanged,
  context,
  height = "100%"
}: EditableGridProps<T>) {
  const gridRef = useRef<AgGridReact<T>>(null);

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({
      editable: true,
      resizable: true,
      sortable: true,
      flex: 1,
      minWidth: 100
    }),
    []
  );

  const onGridReady = useCallback((params: GridReadyEvent<T>) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      if (onCellValueChanged) {
        onCellValueChanged(event);
      }
    },
    [onCellValueChanged]
  );

  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent<T>) => {
      if (onSelectionChanged) {
        const selectedRows = event.api.getSelectedRows();
        onSelectionChanged(selectedRows.length > 0 ? selectedRows[0] : null);
      }
    },
    [onSelectionChanged]
  );

  // Context değiştiğinde hücreleri refresh et
  useEffect(() => {
    if (gridRef.current?.api && context) {
      gridRef.current.api.refreshCells({ force: true });
    }
  }, [context]);

  // Custom theme
  const customTheme = themeQuartz.withParams({
    backgroundColor: "var(--color-surface)",
    foregroundColor: "var(--color-foreground)",
    headerBackgroundColor: "var(--color-surface-elevated)",
    headerTextColor: "var(--color-foreground)",
    oddRowBackgroundColor: "var(--color-surface)",
    rowHoverColor: "var(--color-surface-elevated)",
    borderColor: "var(--color-border)",
    fontFamily: "inherit",
    fontSize: 13,
    headerFontSize: 12,
    rowHeight: 36,
    headerHeight: 40
  });

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-surface h-full w-full"
        style={height !== "100%" ? { height } : undefined}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={height !== "100%" ? { height } : undefined}>
      <AgGridReact<T>
        ref={gridRef}
        theme={customTheme}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        context={context}
        onGridReady={onGridReady}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        rowSelection={{ mode: "singleRow" }}
        suppressCellFocus={false}
        animateRows={false}
        suppressMovableColumns={false}
        enableCellTextSelection={true}
        getRowId={(params) => getRowId(params.data)}
        stopEditingWhenCellsLoseFocus={true}
        singleClickEdit={false}
      />
    </div>
  );
}
