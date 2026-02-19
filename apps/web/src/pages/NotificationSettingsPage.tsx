import { useState } from "react";
import { Bell, Settings, Mail, MessageSquare, History, ListChecks, PlayCircle } from "lucide-react";
import {
  GeneralSettings,
  TemplateList,
  NotificationHistory,
  NotificationQueue,
  CronDryRun,
} from "../features/notification-settings/components";
import { useQueueStats } from "../features/notification-settings/hooks";

type TabId = "general" | "email" | "sms" | "queue" | "history" | "dry-run";

const TABS: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: "general", label: "Genel Ayarlar", icon: Settings },
  { id: "email", label: "E-posta Şablonları", icon: Mail },
  { id: "sms", label: "SMS Şablonları", icon: MessageSquare },
  { id: "queue", label: "Bildirim Kuyruğu", icon: ListChecks },
  { id: "history", label: "Gönderim Geçmişi", icon: History },
  { id: "dry-run", label: "Cron Test", icon: PlayCircle },
];

export function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const { data: stats, isLoading: statsLoading } = useQueueStats();

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Başlık */}
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
              Bildirim Ayarları
            </h1>
          </div>

          {/* İstatistik Chip'leri */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-xs">
              <span className="text-[var(--color-muted-foreground)]">Bekleyen:</span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {statsLoading ? "—" : stats?.pendingInvoices ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-xs">
              <span className="text-[var(--color-muted-foreground)]">Vadesi Gelen:</span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {statsLoading ? "—" : stats?.dueInvoices ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-error)]/10 text-xs">
              <span className="text-[var(--color-error)]">Vadesi Geçmiş:</span>
              <span className="font-semibold text-[var(--color-error)]">
                {statsLoading ? "—" : stats?.overdueInvoices ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-xs">
              <span className="text-[var(--color-muted-foreground)]">Kontratlar:</span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {statsLoading ? "—" : stats?.pendingContracts ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Butonları */}
        <div className="flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "email" && <TemplateList channel="email" />}
        {activeTab === "sms" && <TemplateList channel="sms" />}
        {activeTab === "queue" && <NotificationQueue />}
        {activeTab === "history" && <NotificationHistory />}
        {activeTab === "dry-run" && <CronDryRun />}
      </div>
    </div>
  );
}
