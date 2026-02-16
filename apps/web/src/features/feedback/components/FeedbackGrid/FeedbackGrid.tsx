import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { ToolbarButtonConfig, ToolbarConfig, SortingState } from "@kerzz/grid";
import { feedbackColumnDefs } from "./columnDefs";
import type { Feedback } from "../../types/feedback.types";

interface FeedbackGridProps {
  data: Feedback[];
  loading: boolean;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  onRowDoubleClick?: (feedback: Feedback) => void;
  onSelectionChanged?: (feedback: Feedback | null) => void;
  toolbarButtons?: ToolbarButtonConfig[];
}

export function FeedbackGrid({
  data,
  loading,
  onSortChange,
  onRowDoubleClick,
  onSelectionChanged,
  toolbarButtons,
}: FeedbackGridProps) {
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
    (row: Feedback) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: Feedback) => {
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

  const toolbarConfig: ToolbarConfig<Feedback> = useMemo(
    () => ({
      showSearch: true,
      showColumnVisibility: true,
      showExcelExport: true,
      customButtons: toolbarButtons,
    }),
    [toolbarButtons],
  );

  const columns = feedbackColumnDefs.map((col) => ({
    ...col,
    cellClassName: (_value: unknown, row: Feedback) => {
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
      <Grid<Feedback>
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
        stateKey="feedbacks-grid"
        stateStorage="localStorage"
      />
    </div>
  );
}
