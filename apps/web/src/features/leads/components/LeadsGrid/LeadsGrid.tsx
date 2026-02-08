import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import { leadColumnDefs } from "./columnDefs";
import type { Lead } from "../../types/lead.types";

interface LeadsGridProps {
  data: Lead[];
  loading: boolean;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  onRowDoubleClick?: (lead: Lead) => void;
}

export function LeadsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick,
}: LeadsGridProps) {
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
    (row: Lead) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
    },
    [selectedId],
  );

  const handleRowDoubleClick = useCallback(
    (row: Lead) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const handleSortChange = useCallback(
    (field: string, order: "asc" | "desc") => {
      onSortChange?.(field, order);
    },
    [onSortChange],
  );

  const columns = leadColumnDefs.map((col) => ({
    ...col,
    cellClassName: (_value: unknown, row: Lead) => {
      const original =
        typeof col.cellClassName === "function"
          ? col.cellClassName(_value, row)
          : col.cellClassName || "";
      return selectedId === row._id
        ? `${original} bg-[var(--color-primary)]/10`.trim()
        : original;
    },
  }));

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<Lead>
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
        toolbar={{
          search: true,
          columnVisibility: true,
          excelExport: true,
        }}
        stateKey="leads-grid"
        stateStorage="localStorage"
      />
    </div>
  );
}
