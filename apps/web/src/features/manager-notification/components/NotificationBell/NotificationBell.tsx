import { useState, useCallback, useMemo } from "react";
import { Bell, Volume2, VolumeX } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import {
  useManagerNotifications,
  useManagerNotificationUnreadCount,
  useMarkManagerNotificationAsRead,
  useMarkAllManagerNotificationsAsRead,
  useManagerNotificationSocket,
  useNotificationSound,
} from "../../hooks";
import { warmupAudioContext } from "../../utils";
import { useLogPanelStore } from "../../../manager-log/store/logPanelStore";
import { useAuthStore } from "../../../auth/store/authStore";
import type { ManagerNotification } from "../../types";
import type { EntityTabType } from "../../../manager-log/types";

// contextType -> panel modu eşleştirmesi
const ENTITY_TYPES = ["contract", "license", "invoice", "payment-plan"] as const;
const PIPELINE_TYPES = ["lead", "offer", "sale"] as const;

// Entity tab başlıkları
const ENTITY_TITLES: Record<string, string> = {
  contract: "Kontrat Logları",
  license: "Lisans Logları",
  invoice: "Fatura Logları",
  "payment-plan": "Ödeme Planı Logları",
};

// Pipeline tab başlıkları
const PIPELINE_TITLES: Record<string, string> = {
  lead: "Lead Logları",
  offer: "Teklif Logları",
  sale: "Satış Logları",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo } = useAuthStore();
  const { openPanel, openEntityPanel, openPipelinePanel } = useLogPanelStore();
  const { isSoundEnabled, toggleSound, playSound } = useNotificationSound();

  const userId = userInfo?.id || "";

  // WebSocket dinleyicisini aktif et (yeni bildirimde ses çal)
  const socketOptions = useMemo(
    () => ({ onNewNotification: playSound }),
    [playSound]
  );
  useManagerNotificationSocket(userId || null, socketOptions);

  const { data: unreadData } = useManagerNotificationUnreadCount(userId);
  const { data: notificationsData, isLoading } = useManagerNotifications({
    userId,
    limit: 20,
  });

  const markAsReadMutation = useMarkManagerNotificationAsRead();
  const markAllAsReadMutation = useMarkAllManagerNotificationsAsRead();

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  const handleNotificationClick = useCallback(
    async (notification: ManagerNotification) => {
      // Okundu olarak işaretle
      if (!notification.read) {
        await markAsReadMutation.mutateAsync({
          id: notification._id,
          userId,
        });
      }

      const { contextType, contextId, customerId, logId, pipelineRef, customerName, contextLabel } = notification;

      // Entity türleri için EntityLogPanel aç
      if (ENTITY_TYPES.includes(contextType as typeof ENTITY_TYPES[number])) {
        // contextType'a göre doğru ID alanını belirle
        const idFieldMap: Record<string, string> = {
          contract: "contractId",
          license: "licenseId",
          invoice: "invoiceId",
          "payment-plan": "paymentPlanId",
        };
        const idField = idFieldMap[contextType];

        openEntityPanel(
          {
            customerId,
            customerName,
            contextLabel,
            activeTab: contextType as EntityTabType,
            [idField]: contextId,
            title: ENTITY_TITLES[contextType] || "Loglar",
          },
          logId
        );
      }
      // Pipeline türleri için PipelineLogPanel aç (pipelineRef varsa)
      else if (
        PIPELINE_TYPES.includes(contextType as typeof PIPELINE_TYPES[number]) &&
        pipelineRef
      ) {
        // contextType'a göre doğru ID alanını belirle
        const idFieldMap: Record<string, string> = {
          lead: "leadId",
          offer: "offerId",
          sale: "saleId",
        };
        const idField = idFieldMap[contextType];

        openPipelinePanel(
          {
            pipelineRef,
            customerId,
            [idField]: contextId,
            title: PIPELINE_TITLES[contextType] || "Pipeline Logları",
          },
          logId
        );
      }
      // Fallback: mevcut openPanel davranışı
      else {
        openPanel(
          {
            customerId,
            contextType,
            contextId,
            title: "Loglar",
          },
          logId
        );
      }

      setIsOpen(false);
    },
    [markAsReadMutation, openPanel, openEntityPanel, openPipelinePanel, userId]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsReadMutation.mutateAsync(userId);
  }, [markAllAsReadMutation, userId]);

  if (!userInfo) return null;

  return (
    <div className="relative flex items-center gap-0.5">
      <button
        onClick={toggleSound}
        className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
        aria-label={isSoundEnabled ? "Bildirim sesini kapat" : "Bildirim sesini aç"}
        title={isSoundEnabled ? "Bildirim sesi açık" : "Bildirim sesi kapalı"}
      >
        {isSoundEnabled ? (
          <Volume2 className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] opacity-50" />
        )}
      </button>

      <button
        onClick={() => {
          // Safari: Her kullanıcı tıklamasında AudioContext'i warmup et
          warmupAudioContext();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="w-5 h-5 text-[var(--color-muted-foreground)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-medium bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-full">
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
