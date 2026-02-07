import { Maximize2, X, Pause, Play, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { BatchCheckProgress } from "../../types";

interface FloatingProgressBarProps {
  progress: BatchCheckProgress;
  onMaximize: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function FloatingProgressBar({
  progress,
  onMaximize,
  onPause,
  onResume,
  onCancel,
  onClose
}: FloatingProgressBarProps) {
  const { totalCount, status, items } = progress;
  
  // Calculate counts from items to ensure accuracy
  const completedCount = items.filter(
    (i) => i.status === "completed" || i.status === "error"
  ).length;
  const errorCount = items.filter((i) => i.status === "error").length;
  
  const percentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isCompleted = status === "completed";

  // Find current processing item
  const currentItem = items.find((item) => item.status === "processing");

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl">
      <div className="rounded-xl bg-surface border border-border shadow-2xl overflow-hidden">
        {/* Progress Bar (top) */}
        <div className="h-1.5 w-full bg-surface-elevated">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? errorCount > 0
                  ? "bg-amber-500"
                  : "bg-green-500"
                : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex items-center gap-4 px-4 py-3">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {isRunning && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
            {isPaused && <Pause className="h-5 w-5 text-amber-500" />}
            {isCompleted && errorCount === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {isCompleted && errorCount > 0 && (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Ödeme Planı Hesaplama
              </span>
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
              {errorCount > 0 && (
                <span className="text-xs text-red-500">({errorCount} hata)</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {isCompleted
                ? "Tamamlandı"
                : isPaused
                  ? "Duraklatıldı"
                  : currentItem
                    ? `İşleniyor: ${currentItem.contract.brand}`
                    : "Hazırlanıyor..."}
            </div>
          </div>

          {/* Percentage */}
          <div className="flex-shrink-0 text-sm font-semibold text-primary">
            {percentage}%
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isCompleted && (
              <>
                {isPaused ? (
                  <button
                    onClick={onResume}
                    className="rounded-lg p-2 text-green-600 hover:bg-green-500/10 transition-colors"
                    title="Devam et"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={onPause}
                    className="rounded-lg p-2 text-amber-600 hover:bg-amber-500/10 transition-colors"
                    title="Duraklat"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onMaximize}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
              title="Detayları göster"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={isCompleted ? onClose : onCancel}
              className="rounded-lg p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors"
              title={isCompleted ? "Kapat" : "İptal et"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
