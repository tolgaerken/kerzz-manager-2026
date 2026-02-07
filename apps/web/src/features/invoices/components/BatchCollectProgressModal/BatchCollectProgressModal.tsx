import { X, Minimize2, Pause, Play, XCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { BatchCollectProgress } from "../../types/batchCollect.types";

interface BatchCollectProgressModalProps {
  progress: BatchCollectProgress;
  onMinimize: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function BatchCollectProgressModal({
  progress,
  onMinimize,
  onPause,
  onResume,
  onCancel,
  onClose
}: BatchCollectProgressModalProps) {
  const { items, totalCount, status } = progress;

  // Calculate counts from items to ensure accuracy
  const completedCount = items.filter(
    (i) => i.status === "completed" || i.status === "error"
  ).length;
  const errorCount = items.filter((i) => i.status === "error").length;
  const pendingCount = items.filter(
    (i) => i.status === "pending" || i.status === "processing"
  ).length;

  const percentage =
    totalCount > 0
      ? Math.min(100, Math.round((completedCount / totalCount) * 100))
      : 0;
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-surface border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Loader2
                className={`h-5 w-5 text-primary ${isRunning ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Toplu Tahsilat
              </h2>
              <p className="text-sm text-muted-foreground">
                {isCompleted
                  ? "Tamamlandı"
                  : isPaused
                    ? "Duraklatıldı"
                    : `${completedCount} / ${totalCount} fatura işlendi`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                onClick={onMinimize}
                className="rounded-lg p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
                title="Arka plana al"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={isCompleted ? onClose : onCancel}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
              title={isCompleted ? "Kapat" : "İptal et"}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">İlerleme</span>
            <span className="text-sm font-medium text-primary">{percentage}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-surface-elevated overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? errorCount > 0
                    ? "bg-amber-500"
                    : "bg-green-500"
                  : "bg-primary"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>
              {completedCount - errorCount} başarılı
              {errorCount > 0 && (
                <span className="text-red-500 ml-2">{errorCount} hatalı</span>
              )}
            </span>
            <span>{pendingCount} bekliyor</span>
          </div>
        </div>

        {/* Items List */}
        <div className="px-6 pb-4">
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-surface-elevated">
            {items.map((item, index) => (
              <div
                key={item.invoiceId}
                className={`flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0 ${
                  item.status === "processing" ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex-shrink-0">
                  {item.status === "pending" && (
                    <div className="h-5 w-5 rounded-full border-2 border-border" />
                  )}
                  {item.status === "processing" && (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  {item.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.invoice.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.invoice.invoiceNumber} -{" "}
                    {new Intl.NumberFormat("tr-TR", {
                      style: "currency",
                      currency: "TRY"
                    }).format(item.invoice.grandTotal)}
                  </p>
                </div>
                <div className="flex-shrink-0 text-xs text-muted-foreground">
                  #{index + 1}
                </div>
                {item.status === "error" && item.error && (
                  <div className="flex-shrink-0" title={item.error}>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="text-sm text-muted-foreground">
            {isCompleted ? (
              <span className="text-green-600 font-medium">
                İşlem tamamlandı
              </span>
            ) : isPaused ? (
              <span className="text-amber-600 font-medium">
                İşlem duraklatıldı
              </span>
            ) : (
              <span>İşlem devam ediyor...</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <>
                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Devam Et
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
                  >
                    <Pause className="h-4 w-4" />
                    Duraklat
                  </button>
                )}
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  İptal
                </button>
              </>
            )}
            {isCompleted && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Tamam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
