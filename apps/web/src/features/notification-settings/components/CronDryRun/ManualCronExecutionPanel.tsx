import { CheckCircle2, Clock3, AlertCircle, RefreshCw, Trash2 } from "lucide-react";
import type { DryRunRunnableRecord } from "./DryRunResultPanel";

export interface CronExecutionLogItem {
  id: string;
  timestamp: string;
  level: "info" | "success" | "error";
  message: string;
}

function getLevelClass(level: CronExecutionLogItem["level"]): string {
  if (level === "success") return "text-[var(--color-success)]";
  if (level === "error") return "text-[var(--color-error)]";
  return "text-[var(--color-info)]";
}

function LevelIcon({ level }: { level: CronExecutionLogItem["level"] }) {
  if (level === "success") {
    return <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />;
  }
  if (level === "error") {
    return <AlertCircle className="h-4 w-4 text-[var(--color-error)]" />;
  }
  return <Clock3 className="h-4 w-4 text-[var(--color-info)]" />;
}

export function ManualCronExecutionPanel({
  selectedRecord,
  logs,
  isRunning,
  onClearLogs,
}: {
  selectedRecord: DryRunRunnableRecord | null;
  logs: CronExecutionLogItem[];
  isRunning: boolean;
  onClearLogs: () => void;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
            Manuel Cron Simulasyonu
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            Dry-run tablosundan bir kayit secip manuel calistirdiginizda adim adim loglar burada gorunur.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearLogs}
          disabled={logs.length === 0 || isRunning}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Log Temizle
        </button>
      </div>

      {selectedRecord ? (
        <div className="mb-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-foreground)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">Kayit:</span>
            <span className="font-mono">{selectedRecord.label}</span>
            <span className="text-[var(--color-muted-foreground)]">({selectedRecord.cronName})</span>
          </div>
          {selectedRecord.payload.kind === "notification-send" ? (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              <span className="font-medium">Hedef:</span>
              <span className="text-[var(--color-muted-foreground)]">
                {selectedRecord.payload.type}:{selectedRecord.payload.id}
              </span>
              <span className="ml-2 font-medium">Kanallar:</span>
              {selectedRecord.payload.channels.map((channel) => (
                <span
                  key={channel}
                  className="rounded-full bg-[var(--color-info)]/10 px-2 py-0.5 text-[var(--color-info)]"
                >
                  {channel.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-1 text-[var(--color-muted-foreground)]">
              targetType={selectedRecord.payload.targetType || "-"} contextId={selectedRecord.payload.contextId || "-"} logId={selectedRecord.payload.logId || "-"} planId={selectedRecord.payload.planId || "-"}
            </div>
          )}
          {isRunning && (
            <div className="mt-1 inline-flex items-center gap-1 text-[var(--color-warning)]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Calisiyor
            </div>
          )}
        </div>
      ) : (
        <div className="mb-3 rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted-foreground)]">
          Henuz manuel test calistirilmadi.
        </div>
      )}

      <div className="max-h-64 space-y-1 overflow-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        {logs.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs text-[var(--color-muted-foreground)]">
            Log kaydi yok.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 rounded px-2 py-1 text-xs hover:bg-[var(--color-surface-hover)]"
            >
              <LevelIcon level={log.level} />
              <span className="w-20 flex-shrink-0 font-mono text-[var(--color-muted-foreground)]">
                {log.timestamp}
              </span>
              <span className={getLevelClass(log.level)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
