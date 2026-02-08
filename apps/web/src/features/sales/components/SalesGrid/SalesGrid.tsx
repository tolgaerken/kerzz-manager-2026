import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef, ToolbarButtonConfig, ToolbarConfig } from "@kerzz/grid";
import type { SortingState } from "@tanstack/react-table";
import { salesColumnDefs } from "./columnDefs";
import type { Sale } from "../../types/sale.types";

export interface SalesGridProps {
  data: Sale[];
  loading: boolean;
  onRowDoubleClick?: (item: Sale) => void;
  onSelectionChanged?: (item: Sale | null) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  toolbarButtons?: ToolbarButtonConfig[];
}

export function SalesGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
  onSortChange,
  toolbarButtons,
}: SalesGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleRowClick = useCallback(
    (row: Sale) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged]
  );

  const handleRowDoubleClick = useCallback(
    (row: Sale) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick]
  );

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0 && onSortChange) {
        const { id, desc } = sorting[0];
        onSortChange(id, desc ? "desc" : "asc");
      }
    },
    [onSortChange]
  );

  const toolbarConfig: ToolbarConfig<Sale> = useMemo(
    () => ({
      customButtons: toolbarButtons,
    }),
    [toolbarButtons]
  );

  const columns: GridColumnDef<Sale>[] = salesColumnDefs.map((col) => ({
    ...col,
    cellClassName: (_value: unknown, row: Sale) => {
      const original =
        typeof col.cellClassName === "function"
          ? col.cellClassName(_value, row)
          : col.cellClassName || "";
      return selectedId === row._id
        ? `${original} bg-blue-50 dark:bg-blue-900/20`.trim()
        : original;
    },
  }));

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<Sale>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onSortChange={handleSortChange}
        stripedRows
        toolbar={toolbarConfig}
        stateKey="sales"
      />
    </div>
  );
}
