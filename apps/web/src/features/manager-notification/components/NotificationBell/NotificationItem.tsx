import { useMemo } from "react";
import { AtSign, Calendar, Circle } from "lucide-react";
import type { ManagerNotification } from "../../types";

interface NotificationItemProps {
  notification: ManagerNotification;
  onClick: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
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

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-elevated transition-colors ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      {/* İkon */}
      <div
        className={`flex-shrink-0 p-2 rounded-full ${
          notification.type === "mention"
            ? "bg-primary/10 text-primary"
            : "bg-warning/10 text-warning"
        }`}
      >
        {notification.type === "mention" ? (
          <AtSign className="w-4 h-4" />
        ) : (
          <Calendar className="w-4 h-4" />
        )}
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground line-clamp-2">
          {notification.type === "mention"
            ? "Sizi bir logda etiketledi"
            : "Hatırlatma zamanı geldi"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
      </div>

      {/* Okunmamış göstergesi */}
      {!notification.read && (
        <Circle className="w-2 h-2 text-primary fill-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}
