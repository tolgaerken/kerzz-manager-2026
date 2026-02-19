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
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header Container */}
      <div className="mb-3 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
        {/* Üst satır: Title + Tab Butonları */}
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              Bildirim Ayarları
            </h1>
          </div>

          {/* Tab Butonları */}
          <div className="flex items-center gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border-subtle bg-surface-elevated text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alt satır: İstatistik Chip'leri */}
        <div className="hidden md:flex items-center gap-1.5 px-3 pb-3 md:px-4 md:pb-4">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Bekleyen: {statsLoading ? "—" : stats?.pendingInvoices ?? 0}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Vadesi Gelen: {statsLoading ? "—" : stats?.dueInvoices ?? 0}
          </span>
          <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
            Vadesi Geçmiş: {statsLoading ? "—" : stats?.overdueInvoices ?? 0}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Kontratlar: {statsLoading ? "—" : stats?.pendingContracts ?? 0}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-surface overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "email" && <TemplateList channel="email" />}
            {activeTab === "sms" && <TemplateList channel="sms" />}
            {activeTab === "queue" && <NotificationQueue />}
            {activeTab === "history" && <NotificationHistory />}
            {activeTab === "dry-run" && <CronDryRun />}
          </div>
        </div>
      </div>
    </div>
  );
}
