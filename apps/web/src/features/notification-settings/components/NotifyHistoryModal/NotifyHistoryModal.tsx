import { useState } from "react";
import {
  X,
  Mail,
  MessageSquare,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Tag,
  Eye,
} from "lucide-react";
import { useNotificationLogs } from "../../hooks";
import { getTemplateLabel } from "./templateCodeLabels";
import { MessageContentModal } from "./MessageContentModal";
import type { QueueNotifyEntry, NotificationLog } from "../../types";

interface NotifyHistoryModalProps {
  isOpen: boolean;
  invoiceId: string;
  invoiceNumber: string;
  history: QueueNotifyEntry[];
  onClose: () => void;
}

function formatSentAt(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function LogEntryRow({
  log,
  index,
  onViewContent,
}: {
  log: NotificationLog;
  index: number;
  onViewContent: (log: NotificationLog) => void;
}) {
  const isEmail = log.channel === "email";
  const isSent = log.status === "sent";

  return (
    <div className={`py-3 ${index > 0 ? "border-t border-[var(--color-border)]" : ""}`}>
      {/* Row 1: Time + Status + Channel */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {formatSentAt(log.sentAt)}
          </span>
          {isSent ? (
            <CheckCircle className="w-3.5 h-3.5 text-[var(--color-success)]" />
          ) : (
            <XCircle className="w-3.5 h-3.5 text-[var(--color-error)]" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              isEmail
                ? "bg-[var(--color-info)]/10 text-[var(--color-info)]"
                : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
            }`}
          >
            {isEmail ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
            {isEmail ? "E-posta" : "SMS"}
          </span>
        </div>
      </div>

      {/* Row 2: Template / Condition */}
      <div className="flex items-center gap-2 mb-1.5 pl-5">
        <Tag className="w-3 h-3 text-[var(--color-muted-foreground)] shrink-0" />
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {getTemplateLabel(log.templateCode)}
        </span>
      </div>

      {/* Row 3: Recipient */}
      <div className="flex items-center gap-2 pl-5">
        <User className="w-3 h-3 text-[var(--color-muted-foreground)] shrink-0" />
        <span className="text-sm text-[var(--color-foreground)]">
          {log.recipientName || "—"}
        </span>
        {isEmail && log.recipientEmail && (
          <span className="text-xs text-[var(--color-info)]">{log.recipientEmail}</span>
        )}
        {!isEmail && log.recipientPhone && (
          <span className="text-xs text-[var(--color-success)]">{log.recipientPhone}</span>
        )}
      </div>

      {/* Row 4: Error message if failed */}
      {!isSent && log.errorMessage && (
        <div className="mt-1.5 pl-5 text-xs text-[var(--color-error)]">
          {log.errorMessage}
        </div>
      )}

      {/* Row 5: View content button */}
      {log.renderedBody && (
        <div className="mt-2 pl-5">
          <button
            onClick={() => onViewContent(log)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-md hover:bg-[var(--color-primary)]/20 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Mesaj İçeriğini Gör
          </button>
        </div>
      )}
    </div>
  );
}

function FallbackEntryRow({ entry, index }: { entry: QueueNotifyEntry; index: number }) {
  return (
    <div className={`py-3 ${index > 0 ? "border-t border-[var(--color-border)]" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {entry.sendTime ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {entry.email && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--color-info)]/10 text-[var(--color-info)]">
              <Mail className="w-3 h-3" />
              E-posta
            </span>
          )}
          {entry.sms && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
              <MessageSquare className="w-3 h-3" />
              SMS
            </span>
          )}
        </div>
      </div>
      {entry.users.length > 0 && (
        <div className="pl-5 space-y-1">
          {entry.users.map((u, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <User className="w-3 h-3 shrink-0" />
              <span className="text-[var(--color-foreground)]">{u.name || "—"}</span>
              {u.email && <span className="text-[var(--color-info)]">{u.email}</span>}
              {u.phone && <span className="text-[var(--color-success)]">{u.phone}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotifyHistoryModal({
  isOpen,
  invoiceId,
  invoiceNumber,
  history,
  onClose,
}: NotifyHistoryModalProps) {
  const [contentLog, setContentLog] = useState<NotificationLog | null>(null);

  const { data: logsData, isLoading } = useNotificationLogs(
    { invoiceId, limit: 100 },
    { enabled: isOpen && !!invoiceId }
  );

  if (!isOpen) return null;

  const logs = logsData?.data ?? [];
  const hasDetailedLogs = logs.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                Bildirim Geçmişi
              </h2>
              {invoiceNumber && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FileText className="w-3 h-3 text-[var(--color-muted-foreground)]" />
                  <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
                    {invoiceNumber}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-muted-foreground)]" />
              </div>
            ) : hasDetailedLogs ? (
              <div>
                {logs.map((log, i) => (
                  <LogEntryRow
                    key={log._id}
                    log={log}
                    index={i}
                    onViewContent={setContentLog}
                  />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div>
                {history.map((entry, i) => (
                  <FallbackEntryRow key={i} entry={entry} index={i} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                Henüz bildirim gönderilmemiş
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] shrink-0">
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {hasDetailedLogs ? logs.length : history.length} gönderim
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-md hover:bg-[var(--color-border)] transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Message content modal */}
      {contentLog && (
        <MessageContentModal
          log={contentLog}
          onClose={() => setContentLog(null)}
        />
      )}
    </>
  );
}
