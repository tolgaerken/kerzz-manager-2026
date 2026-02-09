import { AlertCircle, RefreshCw } from "lucide-react";
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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline Kanban</h1>
          <p className="mt-1 text-sm text-muted">
            Lead → Teklif → Satış akışını yönetin
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-muted transition-colors hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

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
  );
}
