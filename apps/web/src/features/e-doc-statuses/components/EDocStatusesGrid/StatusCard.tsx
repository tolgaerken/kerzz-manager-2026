import { memo } from "react";
import {
  FileText,
  AlertTriangle,
  Truck,
  Archive,
  Receipt,
  ChevronRight,
} from "lucide-react";
import type { IntegratorStatusItem } from "../../types";

interface StatusCardProps {
  item: IntegratorStatusItem;
  onClick?: (item: IntegratorStatusItem) => void;
}

function CountBadge({
  label,
  count,
  errorCount,
  icon,
}: {
  label: string;
  count: number;
  errorCount?: number;
  icon: React.ReactNode;
}) {
  const hasError = (errorCount ?? 0) > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-[var(--color-foreground)]">
          {count.toLocaleString("tr-TR")}
        </span>
        {hasError && (
          <span className="flex items-center gap-0.5 text-[10px] font-medium text-[var(--color-error)]">
            <AlertTriangle className="h-3 w-3" />
            {errorCount}
          </span>
        )}
      </div>
    </div>
  );
}

function GibStatusBadge({ status }: { status: string }) {
  const isOk =
    status === "Başarılı" || status === "Onaylandı" || status === "Gönderildi";
  const isNone =
    status.includes("Yok") || status.includes("yok");

  let className =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ";
  if (isOk) {
    className +=
      "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  } else if (isNone) {
    className +=
      "bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]";
  } else {
    className +=
      "bg-[var(--color-warning)]/10 text-[var(--color-warning)]";
  }

  return <span className={className}>{status}</span>;
}

export const StatusCard = memo(function StatusCard({
  item,
  onClick,
}: StatusCardProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition-all hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]"
    >
      {/* Header: VKN + Firma Adı */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-medium text-[var(--color-muted-foreground)]">
            VKN: {item.taxpayerVknTckn}
          </span>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] line-clamp-2">
            {item.taxpayerName}
          </h3>
        </div>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)] flex-shrink-0 mt-1" />
      </div>

      {/* Belge Sayıları */}
      <div className="flex flex-col gap-1.5 mb-2">
        <CountBadge
          label="e-Fatura"
          count={item.eInvoiceCount}
          errorCount={item.errorEInvoiceCount}
          icon={<FileText className="h-3.5 w-3.5" />}
        />
        <CountBadge
          label="e-İrsaliye"
          count={item.eWaybillCount}
          errorCount={item.errorEWaybillCount}
          icon={<Truck className="h-3.5 w-3.5" />}
        />
        <CountBadge
          label="e-Arşiv"
          count={item.eArchiveInvoiceCount}
          icon={<Archive className="h-3.5 w-3.5" />}
        />
        <CountBadge
          label="e-Adisyon"
          count={item.eReceiptCount}
          icon={<Receipt className="h-3.5 w-3.5" />}
        />
      </div>

      {/* GİB Durumları */}
      <div className="flex flex-wrap gap-1 border-t border-[var(--color-border)]/50 pt-2">
        <GibStatusBadge status={item.eArchiveReportGibStatus} />
        <GibStatusBadge status={item.eReceiptReportGibStatus} />
      </div>
    </div>
  );
});
