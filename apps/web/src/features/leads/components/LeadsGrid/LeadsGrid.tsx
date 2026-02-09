import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { ToolbarButtonConfig, ToolbarConfig, SortingState } from "@kerzz/grid";
import { leadColumnDefs } from "./columnDefs";
import type { Lead } from "../../types/lead.types";

interface LeadsGridProps {
  data: Lead[];
  loading: boolean;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  onRowDoubleClick?: (lead: Lead) => void;
  onSelectionChanged?: (lead: Lead | null) => void;
  toolbarButtons?: ToolbarButtonConfig[];
}

export function LeadsGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick,
  onSelectionChanged,
  toolbarButtons,
}: LeadsGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const staleCutoff = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return cutoff;
  }, []);

  const isStaleLead = useCallback(
    (lead: Lead) =>
      ["new", "contacted", "qualified"].includes(lead.status) &&
      lead.updatedAt &&
      new Date(lead.updatedAt) <= staleCutoff,
    [staleCutoff]
  );

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
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: Lead) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const handleSortChange = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0 && onSortChange) {
        const { id, desc } = sorting[0];
        onSortChange(id, desc ? "desc" : "asc");
      }
    },
    [onSortChange],
  );

  const toolbarConfig: ToolbarConfig<Lead> = useMemo(
    () => ({
      showSearch: true,
      showColumnVisibility: true,
      showExcelExport: true,
      customButtons: toolbarButtons,
    }),
    [toolbarButtons]
  );

  const columns = leadColumnDefs.map((col) => ({
    ...col,
    cellClassName: (_value: unknown, row: Lead) => {
      const original =
        typeof col.cellClassName === "function"
          ? col.cellClassName(_value, row)
          : col.cellClassName || "";
      const staleClass = isStaleLead(row)
        ? " bg-[var(--color-warning)]/10"
        : "";
      return selectedId === row._id
        ? `${original}${staleClass} bg-[var(--color-primary)]/10`.trim()
        : `${original}${staleClass}`.trim();
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
        toolbar={toolbarConfig}
        stateKey="leads-grid"
        stateStorage="localStorage"
      />
    </div>
  );
}
