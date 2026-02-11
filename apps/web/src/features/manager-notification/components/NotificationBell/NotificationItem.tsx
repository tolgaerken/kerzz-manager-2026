import { useMemo, useState, useCallback } from "react";
import { AlertTriangle, AtSign, Calendar, Circle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useManagerLogForNotification } from "../../../manager-log/hooks";
import type { ManagerNotification } from "../../types";

interface NotificationItemProps {
  notification: ManagerNotification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const [expanded, setExpanded] = useState(false);

  // Log detayını sadece expand edildiğinde fetch et
  const { data: logData, isLoading: isLogLoading } = useManagerLogForNotification(
    notification.logId,
    expanded
  );

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

  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(() => {
    onClick();
  }, [onClick]);

  return (
    <div
      className={`w-full text-left transition-colors ${
        !notification.read ? "bg-[var(--color-primary)]/5" : ""
      }`}
    >
      {/* Ana içerik - tıklanabilir */}
      <button
        onClick={handleItemClick}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-elevated transition-colors"
      >
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
          <p className="text-sm text-foreground line-clamp-2">
            {notification.type === "mention"
              ? "Sizi bir logda etiketledi"
              : notification.type === "stale"
                ? "Hareketsiz kayıt uyarısı"
                : "Hatırlatma zamanı geldi"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
        </div>

        {/* Okunmamış göstergesi */}
        {!notification.read && (
          <Circle className="w-2 h-2 text-[var(--color-primary)] fill-[var(--color-primary)] flex-shrink-0 mt-2" />
        )}
      </button>

      {/* Devamını gör / Daha az gör butonu */}
      <div className="px-4 pb-2">
        <button
          onClick={handleToggleExpand}
          className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Daha az gör
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Devamını gör
            </>
          )}
        </button>
      </div>

      {/* Genişletilmiş içerik */}
      {expanded && (
        <div className="px-4 pb-3 ml-11">
          {isLogLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Yükleniyor...
            </div>
          ) : logData ? (
            <div className="bg-[var(--color-surface-elevated)] rounded-lg p-3 border border-[var(--color-border)]">
              <p className="text-xs font-medium text-foreground">
                {logData.authorName}:
              </p>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                {logData.message}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Log detayı yüklenemedi.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
