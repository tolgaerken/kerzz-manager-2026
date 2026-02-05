import { Shield, Database, Clock, AlertTriangle } from "lucide-react";
import type { SystemLogStats } from "../../types";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
} from "../../constants/system-logs.constants";

interface SystemLogsStatsProps {
  stats: SystemLogStats | undefined;
}

export function SystemLogsStats({ stats }: SystemLogsStatsProps) {
  if (!stats) return null;

  const categoryItems = [
    {
      key: "AUTH",
      icon: Shield,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      key: "CRUD",
      icon: Database,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      key: "CRON",
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      key: "SYSTEM",
      icon: AlertTriangle,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Toplam */}
      <div className="px-4 py-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">Toplam</p>
        <p className="text-xl font-bold text-[var(--color-foreground)]">
          {stats.total.toLocaleString("tr-TR")}
        </p>
      </div>

      {/* Kategoriler */}
      {categoryItems.map(({ key, icon: Icon, color, bgColor }) => (
        <div
          key={key}
          className={`px-4 py-3 rounded-lg ${bgColor} border border-[var(--color-border)]`}
        >
          <div className="flex items-center gap-1.5">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <p className="text-xs text-[var(--color-text-muted)]">
              {CATEGORY_LABELS[key]}
            </p>
          </div>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            {(stats.byCategory[key] || 0).toLocaleString("tr-TR")}
          </p>
        </div>
      ))}

      {/* Başarılı */}
      <div className="px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          {STATUS_LABELS.SUCCESS}
        </p>
        <p className="text-xl font-bold text-green-600 dark:text-green-400">
          {(stats.byStatus["SUCCESS"] || 0).toLocaleString("tr-TR")}
        </p>
      </div>

      {/* Hatalı */}
      <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          {STATUS_LABELS.ERROR}
        </p>
        <p className="text-xl font-bold text-red-600 dark:text-red-400">
          {((stats.byStatus["ERROR"] || 0) + (stats.byStatus["FAILURE"] || 0)).toLocaleString("tr-TR")}
        </p>
      </div>
    </div>
  );
}
