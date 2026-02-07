import { useCallback, useEffect, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef } from "@kerzz/grid";
import { eDocMemberColumnDefs } from "./columnDefs";
import { CreditBalanceCell } from "./CreditBalanceCell";
import type { EDocMemberItem } from "../../types/eDocMember.types";

interface EDocMembersGridProps {
  data: EDocMemberItem[];
  loading: boolean;
  onRowDoubleClick?: (item: EDocMemberItem) => void;
  onSelectionChanged?: (item: EDocMemberItem | null) => void;
}

export function EDocMembersGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
}: EDocMembersGridProps) {
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
    (row: EDocMemberItem) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: EDocMemberItem) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const columns: GridColumnDef<EDocMemberItem>[] = eDocMemberColumnDefs.map(
    (col) => {
      // creditBalance kolonu için özel cell renderer
      if (col.id === "creditBalance") {
        return {
          ...col,
          cell: (_value: unknown, row: EDocMemberItem) => (
            <CreditBalanceCell row={row} />
          ),
          cellClassName: (_value: unknown, row: EDocMemberItem) => {
            return selectedId === row._id
              ? "bg-[var(--color-primary)]/10"
              : "";
          },
        };
      }

      return {
        ...col,
        cellClassName: (_value: unknown, row: EDocMemberItem) => {
          const original =
            typeof col.cellClassName === "function"
              ? col.cellClassName(_value, row)
              : col.cellClassName || "";
          return selectedId === row._id
            ? `${original} bg-[var(--color-primary)]/10`.trim()
            : original;
        },
      };
    },
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<EDocMemberItem>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        stripedRows
        toolbar
        stateKey="e-doc-members"
      />
    </div>
  );
}
