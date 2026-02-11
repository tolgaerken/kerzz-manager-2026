import { useState } from "react";
import { AlertCircle, RefreshCw, Columns } from "lucide-react";
import { CollapsibleSection } from "../components/ui/CollapsibleSection";
import { KanbanBoard, usePipelineKanban } from "../features/pipeline-kanban";

export function PipelineKanbanPage() {
  const {
    columns,
    itemsByColumn,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    moveItem,
  } = usePipelineKanban();

  // Collapsible section state
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  // CollapsibleSection hook
  const collapsible = CollapsibleSection({
    icon: <Columns className="h-5 w-5" />,
    title: "Pipeline Kanban",
    expanded: isHeaderExpanded,
    onExpandedChange: setIsHeaderExpanded,
    desktopActions: (
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
        Yenile
      </button>
    ),
    mobileActions: (
      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
      </button>
    ),
    children: (
      <p className="text-sm text-muted-foreground">
        Lead → Teklif → Satış akışını yönetin
      </p>
    ),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Collapsible Header Container */}
      <div {...collapsible.containerProps}>
        {collapsible.headerContent}
        {collapsible.collapsibleContent}
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {isError && (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4 text-[var(--color-error)]">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Pipeline verileri yüklenemedi</p>
              <p className="text-sm opacity-80">
                {error instanceof Error ? error.message : "Bilinmeyen hata"}
              </p>
            </div>
          </div>
        )}

        <KanbanBoard
          columns={columns}
          itemsByColumn={itemsByColumn}
          isLoading={isLoading}
          onMove={moveItem}
        />
      </div>
    </div>
  );
}
