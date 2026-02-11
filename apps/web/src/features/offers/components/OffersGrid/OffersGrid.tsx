import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, FileDown } from "lucide-react";
import { Grid } from "@kerzz/grid";
import type { GridColumnDef, ToolbarButtonConfig, ToolbarConfig } from "@kerzz/grid";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { OfferMobileList } from "./OfferMobileList";
import { offerColumnDefs } from "./columnDefs";
import type { Offer } from "../../types/offer.types";

interface OffersGridProps {
  data: Offer[];
  loading: boolean;
  onRowDoubleClick?: (item: Offer) => void;
  onSelectionChanged?: (item: Offer | null) => void;
  onSortChange?: (field: string, order: "asc" | "desc") => void;
  toolbarButtons?: ToolbarButtonConfig[];
  onScrollDirectionChange?: (direction: "up" | "down" | null, isAtTop: boolean) => void;
  onGenerateDocument?: (offer: Offer, format: "html" | "pdf") => void;
}

export function OffersGrid({
  data,
  loading,
  onRowDoubleClick,
  onSelectionChanged,
  onSortChange,
  toolbarButtons,
  onScrollDirectionChange,
  onGenerateDocument,
}: OffersGridProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const staleCutoff = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);
    return cutoff;
  }, []);

  const isStaleOffer = useCallback(
    (offer: Offer) =>
      ["draft", "sent", "revised", "waiting", "approved"].includes(offer.status) &&
      offer.updatedAt &&
      new Date(offer.updatedAt) <= staleCutoff,
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
    (row: Offer) => {
      const newId = selectedId === row._id ? null : row._id;
      setSelectedId(newId);
      onSelectionChanged?.(newId ? row : null);
    },
    [selectedId, onSelectionChanged],
  );

  const handleRowDoubleClick = useCallback(
    (row: Offer) => {
      onRowDoubleClick?.(row);
    },
    [onRowDoubleClick],
  );

  const toolbarConfig: ToolbarConfig<Offer> = useMemo(
    () => ({
      customButtons: toolbarButtons,
    }),
    [toolbarButtons],
  );

  const actionsColumn: GridColumnDef<Offer> = useMemo(
    () => ({
      id: "actions",
      header: "",
      width: 70,
      sortable: false,
      resizable: false,
      cell: (_value: unknown, row: Offer) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="HTML olarak aç"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateDocument?.(row, "html");
            }}
            className="rounded p-1 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <FileText className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          </button>
          <button
            type="button"
            title="PDF olarak aç"
            onClick={(e) => {
              e.stopPropagation();
              onGenerateDocument?.(row, "pdf");
            }}
            className="rounded p-1 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <FileDown className="h-3.5 w-3.5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
      ),
    }),
    [onGenerateDocument],
  );

  const columns: GridColumnDef<Offer>[] = useMemo(() => {
    const baseCols = offerColumnDefs.map((col) => ({
      ...col,
      cellClassName: (_value: unknown, row: Offer) => {
        const original =
          typeof col.cellClassName === "function"
            ? col.cellClassName(_value, row)
            : col.cellClassName || "";
        const staleClass = isStaleOffer(row)
          ? " bg-[var(--color-warning)]/10"
          : "";
        return selectedId === row._id
          ? `${original}${staleClass} bg-[var(--color-primary)]/10`.trim()
          : `${original}${staleClass}`.trim();
      },
    }));

    if (onGenerateDocument) {
      return [...baseCols, actionsColumn];
    }

    return baseCols;
  }, [selectedId, isStaleOffer, onGenerateDocument, actionsColumn]);

  // Mobile view - single tap opens modal, no multiselect
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <OfferMobileList
          data={data}
          loading={loading}
          onCardClick={(offer) => {
            onSelectionChanged?.(offer);
            onRowDoubleClick?.(offer);
          }}
          onScrollDirectionChange={onScrollDirectionChange}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<Offer>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row._id}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onSortChange={(sorting) => {
          if (sorting.length > 0) {
            const sort = sorting[0];
            onSortChange?.(sort.id, sort.desc ? "desc" : "asc");
          }
        }}
        stripedRows
        toolbar={toolbarConfig}
        stateKey="offers"
      />
    </div>
  );
}
