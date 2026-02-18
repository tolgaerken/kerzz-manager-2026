import { X, Mail, MessageSquare, Clock, User } from "lucide-react";
import type { QueueNotifyEntry } from "../../types";

interface NotifyHistoryModalProps {
  isOpen: boolean;
  invoiceNumber: string;
  history: QueueNotifyEntry[];
  onClose: () => void;
}

function channelBadges(entry: QueueNotifyEntry) {
  const badges: { label: string; icon: React.ReactNode; className: string }[] = [];
  if (entry.email) {
    badges.push({
      label: "E-posta",
      icon: <Mail className="w-3 h-3" />,
      className: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    });
  }
  if (entry.sms) {
    badges.push({
      label: "SMS",
      icon: <MessageSquare className="w-3 h-3" />,
      className: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    });
  }
  return badges;
}

function NotifyEntryRow({ entry, index }: { entry: QueueNotifyEntry; index: number }) {
  const badges = channelBadges(entry);

  return (
    <div
      className={`py-3 ${index > 0 ? "border-t border-[var(--color-border)]" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {entry.sendTime ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {badges.map((b) => (
            <span
              key={b.label}
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${b.className}`}
            >
              {b.icon}
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {entry.users.length > 0 && (
        <div className="pl-5 space-y-1">
          {entry.users.map((u, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
              <User className="w-3 h-3 shrink-0" />
              <span className="text-[var(--color-foreground)]">{u.name || "—"}</span>
              {u.email && (
                <span className="text-[var(--color-info)]">{u.email}</span>
              )}
              {u.phone && (
                <span className="text-[var(--color-success)]">{u.phone}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function NotifyHistoryModal({
  isOpen,
  invoiceNumber,
  history,
  onClose,
}: NotifyHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[var(--color-surface)] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-foreground)]">
              Bildirim Geçmişi
            </h2>
            {invoiceNumber && (
              <span className="text-xs text-[var(--color-muted-foreground)] font-mono">
                {invoiceNumber}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5">
          {history.length > 0 ? (
            <div>
              {history.map((entry, i) => (
                <NotifyEntryRow key={i} entry={entry} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
              Henüz bildirim gönderilmemiş
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)] shrink-0">
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {history.length} gönderim
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
  );
}
