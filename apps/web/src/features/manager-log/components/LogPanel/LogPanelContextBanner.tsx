import { User, FileText, Key, Receipt, Calendar, RefreshCw } from "lucide-react";
import type { EntityTabType } from "../../types";

interface LogPanelContextBannerProps {
  customerName?: string;
  contextLabel?: string;
  activeTab?: EntityTabType;
}

/** Tab tipine göre ikon döndür */
function getContextIcon(activeTab?: EntityTabType) {
  const iconClass = "w-3.5 h-3.5";
  switch (activeTab) {
    case "contract":
      return <FileText className={iconClass} />;
    case "license":
      return <Key className={iconClass} />;
    case "invoice":
      return <Receipt className={iconClass} />;
    case "payment-plan":
      return <Calendar className={iconClass} />;
    case "e-transform":
      return <RefreshCw className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}

/**
 * Log panelinin üstünde müşteri adı ve kaynak bilgisini gösteren banner.
 * customerName veya contextLabel yoksa render edilmez.
 */
export function LogPanelContextBanner({
  customerName,
  contextLabel,
  activeTab,
}: LogPanelContextBannerProps) {
  // Hiçbir bilgi yoksa render etme
  if (!customerName && !contextLabel) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-primary)]/5 border-b border-[var(--color-border)]">
      {/* Müşteri adı */}
      {customerName && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-foreground)]">
          <User className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
          <span className="font-medium truncate max-w-[150px]" title={customerName}>
            {customerName}
          </span>
        </div>
      )}

      {/* Ayırıcı */}
      {customerName && contextLabel && (
        <span className="text-[var(--color-border)]">|</span>
      )}

      {/* Kaynak bilgisi (kontrat no, lisans no vb.) */}
      {contextLabel && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-foreground)]">
          <span className="text-[var(--color-muted-foreground)]">
            {getContextIcon(activeTab)}
          </span>
          <span className="font-medium truncate max-w-[180px]" title={contextLabel}>
            {contextLabel}
          </span>
        </div>
      )}
    </div>
  );
}
