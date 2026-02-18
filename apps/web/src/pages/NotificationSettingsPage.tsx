import { useState } from "react";
import { Settings, Mail, MessageSquare, History, ListChecks, PlayCircle } from "lucide-react";
import {
  GeneralSettings,
  TemplateList,
  NotificationHistory,
  NotificationQueue,
  CronDryRun,
} from "../features/notification-settings/components";

type TabId = "general" | "email" | "sms" | "queue" | "history" | "dry-run";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "general", label: "Genel Ayarlar", icon: <Settings className="w-4 h-4" /> },
  { id: "email", label: "E-posta Şablonları", icon: <Mail className="w-4 h-4" /> },
  { id: "sms", label: "SMS Şablonları", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "queue", label: "Bildirim Kuyruğu", icon: <ListChecks className="w-4 h-4" /> },
  { id: "history", label: "Gönderim Geçmişi", icon: <History className="w-4 h-4" /> },
  { id: "dry-run", label: "Cron Test", icon: <PlayCircle className="w-4 h-4" /> },
];

export function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Bildirim Ayarları
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Fatura ve kontrat bildirimlerini yapılandırın, şablonları düzenleyin ve
          gönderim geçmişini görüntüleyin.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-[var(--color-border)]">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
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
