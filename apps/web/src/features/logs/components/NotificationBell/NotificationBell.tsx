import { useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../hooks";
import { useLogPanelStore } from "../../store/logPanelStore";
import { useAuthStore } from "../../../auth/store/authStore";
import type { Notification } from "../../types";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useAuthStore();
  const { openPanel } = useLogPanelStore();

  const userId = userInfo?.id || "";

  const { data: unreadData } = useUnreadNotificationCount(userId);
  const { data: notificationsData, isLoading } = useNotifications({
    userId,
    limit: 20,
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Okundu olarak işaretle
      if (!notification.read) {
        await markAsReadMutation.mutateAsync({
          id: notification._id,
          userId,
        });
      }

      // Log panelini aç
      openPanel({
        customerId: notification.customerId,
        contextType: notification.contextType,
        contextId: notification.contextId,
        title:
          notification.contextType === "contract"
            ? "Kontrat Logları"
            : "Loglar",
      });

      setIsOpen(false);
    },
    [markAsReadMutation, openPanel, userId]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync(userId);
  }, [markAllAsReadMutation, userId]);

  if (!userInfo) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-surface-elevated transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onNotificationClick={handleNotificationClick}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
