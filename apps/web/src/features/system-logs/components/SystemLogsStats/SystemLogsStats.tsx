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
      color: "text-[var(--color-info)]",
      bgColor: "bg-[var(--color-info)]/10",
    },
    {
      key: "CRUD",
      icon: Database,
      color: "text-[var(--color-success)]",
      bgColor: "bg-[var(--color-success)]/10",
    },
    {
      key: "CRON",
      icon: Clock,
      color: "text-[var(--color-primary)]",
      bgColor: "bg-[var(--color-primary)]/10",
    },
    {
      key: "SYSTEM",
      icon: AlertTriangle,
      color: "text-[var(--color-warning)]",
      bgColor: "bg-[var(--color-warning)]/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Toplam */}
      <div className="px-4 py-3 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-muted-foreground)]">Toplam</p>
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
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {CATEGORY_LABELS[key]}
            </p>
          </div>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            {(stats.byCategory[key] || 0).toLocaleString("tr-TR")}
          </p>
        </div>
      ))}

      {/* Başarılı */}
      <div className="px-4 py-3 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {STATUS_LABELS.SUCCESS}
        </p>
        <p className="text-xl font-bold text-[var(--color-success)]">
          {(stats.byStatus["SUCCESS"] || 0).toLocaleString("tr-TR")}
        </p>
      </div>

      {/* Hatalı */}
      <div className="px-4 py-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {STATUS_LABELS.ERROR}
        </p>
        <p className="text-xl font-bold text-[var(--color-error)]">
          {((stats.byStatus["ERROR"] || 0) + (stats.byStatus["FAILURE"] || 0)).toLocaleString("tr-TR")}
        </p>
      </div>
    </div>
  );
}
