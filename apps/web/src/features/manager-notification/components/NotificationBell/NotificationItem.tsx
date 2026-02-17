import { useMemo } from "react";
import { AlertTriangle, AtSign, Calendar, Circle, Building2, FileText, User } from "lucide-react";
import { useManagerLogForNotification } from "../../../manager-log/hooks";
import { useCustomer } from "../../../customers/hooks/useCustomers";
import type { ManagerNotification } from "../../types";

interface NotificationItemProps {
  notification: ManagerNotification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  // Log detayını fetch et (etiketleyen kişi ve references için)
  const { data: logData } = useManagerLogForNotification(notification.logId, true);

  // customerName yoksa müşteri bilgisini fetch et
  const shouldFetchCustomer = !notification.customerName && !logData;
  const { data: customerData } = useCustomer(shouldFetchCustomer ? notification.customerId : null);

  const formattedDate = useMemo(() => {
    const date = new Date(notification.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
    });
  }, [notification.createdAt]);

  // Etiketleyen kişi (log'dan)
  const authorName = logData?.authorName;

  // Müşteri adı (notification > customer API)
  const resolvedCustomerName = useMemo(() => {
    if (notification.customerName) return notification.customerName;
    if (customerData) return customerData.name || customerData.brand;
    return undefined;
  }, [notification.customerName, customerData]);

  // Context label (notification > log references)
  const resolvedContextLabel = useMemo(() => {
    if (notification.contextLabel) return notification.contextLabel;
    if (logData?.references && logData.references.length > 0) {
      const matchingRef = logData.references.find((ref) => ref.type === notification.contextType);
      if (matchingRef?.label) return matchingRef.label;
      return logData.references[0]?.label;
    }
    return undefined;
  }, [notification.contextLabel, notification.contextType, logData?.references]);

  // Bildirim türüne göre başlık (etiketleyen kişi adıyla)
  const notificationTitle = useMemo(() => {
    switch (notification.type) {
      case "mention":
        return authorName ? `${authorName} sizi etiketledi` : "Sizi bir logda etiketledi";
      case "stale":
        return "Hareketsiz kayıt uyarısı";
      case "reminder":
        return "Hatırlatma zamanı geldi";
      default:
        return "Bildirim";
    }
  }, [notification.type, authorName]);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left transition-colors hover:bg-[var(--color-surface-elevated)] ${
        !notification.read ? "bg-[var(--color-primary)]/5" : ""
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* İkon */}
        <div
          className={`flex-shrink-0 p-2 rounded-full ${
            notification.type === "mention"
              ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              : notification.type === "stale"
                ? "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                : "bg-[var(--color-info)]/10 text-[var(--color-info)]"
          }`}
        >
          {notification.type === "mention" ? (
            <AtSign className="w-4 h-4" />
          ) : notification.type === "stale" ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
        </div>

        {/* İçerik */}
        <div className="flex-1 min-w-0">
          {/* Başlık - Etiketleyen kişi */}
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {notificationTitle}
          </p>

          {/* Firma ve kaynak bilgisi */}
          {(resolvedCustomerName || resolvedContextLabel) && (
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1 text-xs text-[var(--color-muted-foreground)]">
              {resolvedCustomerName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[140px]">{resolvedCustomerName}</span>
                </span>
              )}
              {resolvedCustomerName && resolvedContextLabel && (
                <span className="text-[var(--color-border)]">•</span>
              )}
              {resolvedContextLabel && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{resolvedContextLabel}</span>
                </span>
              )}
            </div>
          )}

          {/* Tam mesaj */}
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5 whitespace-pre-wrap break-words">
            {notification.message}
          </p>

          {/* Tarih */}
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5 opacity-70">
            {formattedDate}
          </p>
        </div>

        {/* Okunmamış göstergesi */}
        {!notification.read && (
          <Circle className="w-2 h-2 text-[var(--color-primary)] fill-[var(--color-primary)] flex-shrink-0 mt-2" />
        )}
      </div>
    </button>
  );
}
