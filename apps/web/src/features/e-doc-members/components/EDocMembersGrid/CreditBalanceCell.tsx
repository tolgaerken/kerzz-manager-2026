import type { EDocMemberItem } from "../../types/eDocMember.types";

type BalanceStatus = "depleted" | "critical" | "low" | "limited" | "sufficient";

interface StatusInfo {
  label: string;
  className: string;
  badgeClassName: string;
}

function getBalanceStatus(
  creditBalance: number,
  monthlyAverage: number,
): BalanceStatus {
  const absAvg = Math.abs(monthlyAverage);

  if (creditBalance < 0) return "depleted";
  if (absAvg > 0 && creditBalance <= absAvg) return "critical";
  if (absAvg > 0 && creditBalance <= absAvg * 2) return "low";
  if (absAvg > 0 && creditBalance / absAvg < 3) return "limited";
  return "sufficient";
}

function getStatusInfo(status: BalanceStatus): StatusInfo {
  switch (status) {
    case "depleted":
      return {
        label: "TÜKENDİ",
        className:
          "bg-[var(--color-error)] text-[var(--color-error-foreground)]",
        badgeClassName:
          "bg-[var(--color-error)]/15 text-[var(--color-error)] border-[var(--color-error)]/30",
      };
    case "critical":
      return {
        label: "KRİTİK",
        className:
          "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
        badgeClassName:
          "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30",
      };
    case "low":
      return {
        label: "DÜŞÜK",
        className:
          "bg-[var(--color-warning)]/20 text-[var(--color-foreground)]",
        badgeClassName:
          "bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20",
      };
    case "limited": {
      return {
        label: "",
        className: "bg-[var(--color-info)] text-[var(--color-info-foreground)]",
        badgeClassName:
          "bg-[var(--color-info)]/15 text-[var(--color-info)] border-[var(--color-info)]/30",
      };
    }
    case "sufficient":
      return {
        label: "YETERLİ",
        className: "",
        badgeClassName:
          "bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/30",
      };
  }
}

function getBalanceLabel(
  creditBalance: number,
  monthlyAverage: number,
): string {
  const absAvg = Math.abs(monthlyAverage);
  const status = getBalanceStatus(creditBalance, monthlyAverage);

  if (status === "limited" && absAvg > 0) {
    const months = Math.round(creditBalance / absAvg);
    return `~${months} AY`;
  }

  if (status === "sufficient" && absAvg === 0) {
    return "YETERLİ";
  }

  return getStatusInfo(status).label;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value);

interface CreditBalanceCellProps {
  row: EDocMemberItem;
}

export function CreditBalanceCell({ row }: CreditBalanceCellProps) {
  const { creditBalance, monthlyAverage } = row;
  const status = getBalanceStatus(creditBalance, monthlyAverage);
  const info = getStatusInfo(status);
  const label = getBalanceLabel(creditBalance, monthlyAverage);

  return (
    <div className="flex items-center justify-between gap-2 w-full px-1">
      <span
        className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded border ${info.badgeClassName}`}
      >
        {label}
      </span>
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${info.className}`}
      >
        {formatNumber(creditBalance)}
      </span>
    </div>
  );
}

// Export helpers for column cellClassName usage
export { getBalanceStatus, getStatusInfo };
