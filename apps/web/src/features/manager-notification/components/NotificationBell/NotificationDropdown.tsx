import { useRef, useEffect } from "react";
import { Bell, BellOff, CheckCheck, Loader2 } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import type { ManagerNotification } from "../../types";

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: ManagerNotification[];
  isLoading: boolean;
  onClose: () => void;
  onNotificationClick: (notification: ManagerNotification) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDropdown({
  isOpen,
  notifications,
  isLoading,
  onClose,
  onNotificationClick,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">Bildirimler</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <BellOff className="w-10 h-10 mb-2" />
            <p className="text-sm">Bildirim yok</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-surface-elevated">
          <button className="w-full text-xs text-center text-primary hover:text-primary/80 transition-colors">
            Tüm bildirimleri gör
          </button>
        </div>
      )}
    </div>
  );
}
