import { X, Clock, User, Server, Globe, FileCode } from "lucide-react";
import type { SystemLog } from "../../types";
import {
  CATEGORY_LABELS,
  ACTION_LABELS,
  STATUS_LABELS,
  MODULE_LABELS,
} from "../../constants/system-logs.constants";

interface SystemLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: SystemLog | null;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    SUCCESS: "bg-green-500",
    FAILURE: "bg-yellow-500",
    ERROR: "bg-red-500",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colorMap[status] || "bg-gray-400"}`}
    />
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <dt className="text-xs text-[var(--color-text-muted)]">{label}</dt>
        <dd className="text-sm text-[var(--color-foreground)] break-all">
          {value ?? "-"}
        </dd>
      </div>
    </div>
  );
}

export function SystemLogDetailModal({
  isOpen,
  onClose,
  log,
}: SystemLogDetailModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <StatusDot status={log.status} />
            <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
              Log Detayı
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-64px)] px-6 py-4">
          {/* Özet Kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)]">
              <p className="text-xs text-[var(--color-text-muted)]">Kategori</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {CATEGORY_LABELS[log.category] || log.category}
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)]">
              <p className="text-xs text-[var(--color-text-muted)]">Aksiyon</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {ACTION_LABELS[log.action] || log.action}
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)]">
              <p className="text-xs text-[var(--color-text-muted)]">Durum</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {STATUS_LABELS[log.status] || log.status}
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)]">
              <p className="text-xs text-[var(--color-text-muted)]">Modül</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {MODULE_LABELS[log.module] || log.module}
              </p>
            </div>
          </div>

          {/* Detay Bilgileri */}
          <div className="space-y-1 mb-6">
            <h3 className="text-sm font-medium text-[var(--color-foreground)] mb-2">
              Genel Bilgiler
            </h3>
            <dl className="divide-y divide-[var(--color-border)]">
              <InfoRow icon={Clock} label="Tarih" value={formatDate(log.createdAt)} />
              <InfoRow icon={User} label="Kullanıcı" value={log.userName} />
              <InfoRow icon={User} label="Kullanıcı ID" value={log.userId} />
              <InfoRow icon={Server} label="Entity Tipi" value={log.entityType} />
              <InfoRow icon={Server} label="Entity ID" value={log.entityId} />
              <InfoRow icon={FileCode} label="HTTP Method" value={log.method} />
              <InfoRow icon={FileCode} label="Path" value={log.path} />
              <InfoRow
                icon={FileCode}
                label="Durum Kodu"
                value={log.statusCode}
              />
              <InfoRow
                icon={Clock}
                label="Süre"
                value={log.duration != null ? `${log.duration}ms` : null}
              />
              <InfoRow icon={Globe} label="IP Adresi" value={log.ipAddress} />
              <InfoRow icon={Globe} label="User Agent" value={log.userAgent} />
            </dl>
          </div>

          {/* Hata Mesajı */}
          {log.errorMessage && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-red-500 mb-2">
                Hata Mesajı
              </h3>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {log.errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Detay Verisi (JSON) */}
          {log.details && Object.keys(log.details).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-[var(--color-foreground)] mb-2">
                Ek Detaylar
              </h3>
              <pre className="p-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-foreground)] overflow-x-auto max-h-[300px] overflow-y-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
