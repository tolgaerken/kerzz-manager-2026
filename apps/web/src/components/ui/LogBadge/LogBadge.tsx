import { memo } from "react";
import { MessageSquare } from "lucide-react";
import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

export interface LogBadgeProps {
  /** Son log tarihi (ISO date string) */
  lastLogAt?: string;
  /** Tıklama callback'i */
  onClick?: () => void;
  /** Boyut: "sm" = mobil kart, "md" = grid hücresi */
  size?: "sm" | "md";
  /** Sadece ikon göster, badge olmadan */
  showIconOnly?: boolean;
  /** Özel title metni */
  title?: string;
}

/**
 * Son log tarihinden bugüne kaç gün geçtiğini hesaplar.
 * @param lastLogAt - ISO date string
 * @returns Gün farkı (0 = bugün, 1 = dün, vb.)
 */
function getDaysSinceLastLog(lastLogAt: string): number {
  const lastDate = startOfDay(parseISO(lastLogAt));
  const today = startOfDay(new Date());
  return differenceInCalendarDays(today, lastDate);
}

/**
 * Gün farkına göre renk tonunu döndürür (hex değeri).
 */
function getIndicatorColor(days: number): string {
  if (days === 0) return "#10b981"; // yeşil - bugün
  if (days <= 2) return "#3b82f6"; // mavi - 1-2 gün
  if (days <= 4) return "#f59e0b"; // turuncu - 3-4 gün
  return "#ef4444"; // kırmızı - 5+ gün
}

/**
 * Gün farkına göre tooltip metni.
 */
function getTooltipText(days: number | null): string {
  if (days === null) return "Log yok";
  if (days === 0) return "Son log: Bugün";
  if (days === 1) return "Son log: Dün";
  return `Son log: ${days} gün önce`;
}

/**
 * Generic log badge bileşeni.
 * Minimal tasarım: Renkli dot indicator ile gün durumunu gösterir.
 */
export const LogBadge = memo(function LogBadge({
  lastLogAt,
  onClick,
  size = "md",
  showIconOnly = false,
  title,
}: LogBadgeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const days = lastLogAt ? getDaysSinceLastLog(lastLogAt) : null;
  const tooltipText = title || getTooltipText(days);

  // Boyuta göre stil ayarları
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  // Sadece ikon göster (badge olmadan)
  if (showIconOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center p-1 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-colors"
        title={tooltipText}
      >
        <MessageSquare className={iconSize} strokeWidth={1.5} />
      </button>
    );
  }

  // Mobil kart stili - inline gösterim
  if (size === "sm") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        title={tooltipText}
      >
        <div className="relative">
          <MessageSquare className={iconSize} strokeWidth={1.5} />
          {days !== null && (
            <span
              className={`absolute -top-0.5 -right-0.5 ${dotSize} rounded-full ring-2 ring-[var(--color-surface)]`}
              style={{ backgroundColor: getIndicatorColor(days) }}
            />
          )}
        </div>
      </button>
    );
  }

  // Grid hücresi stili - renkli dot ile minimal gösterim
  return (
    <button
      type="button"
      onClick={handleClick}
      className="group inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] transition-all"
      title={tooltipText}
    >
      <div className="relative">
        <MessageSquare className={iconSize} strokeWidth={1.5} />
        {days !== null && (
          <span
            className={`absolute -top-0.5 -right-0.5 ${dotSize} rounded-full ring-2 ring-[var(--color-surface)] group-hover:ring-[var(--color-surface-hover)] transition-all`}
            style={{ backgroundColor: getIndicatorColor(days) }}
          />
        )}
      </div>
    </button>
  );
});
