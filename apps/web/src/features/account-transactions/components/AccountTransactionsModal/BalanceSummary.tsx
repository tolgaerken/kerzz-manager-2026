import { useMemo } from "react";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import type { AccountTransaction } from "../../types";

interface BalanceSummaryProps {
  transactions: AccountTransaction[];
  loading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function BalanceSummary({ transactions, loading }: BalanceSummaryProps) {
  const summary = useMemo(() => {
    const totalDebit = transactions.reduce((sum, t) => sum + (t.BORC || 0), 0);
    const totalCredit = transactions.reduce((sum, t) => sum + (t.ALACAK || 0), 0);
    const balance = totalDebit - totalCredit;

    return { totalDebit, totalCredit, balance };
  }, [transactions]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface-elevated)] rounded-lg p-3 md:p-4 animate-pulse"
          >
            <div className="h-4 bg-[var(--color-border)] rounded w-20 mb-2" />
            <div className="h-6 bg-[var(--color-border)] rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-3 md:p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-xs md:text-sm mb-1">
          <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-error)]" />
          <span>Borç</span>
        </div>
        <div className="text-base md:text-lg font-semibold text-[var(--color-error)]">
          {formatCurrency(summary.totalDebit)}
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-3 md:p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-xs md:text-sm mb-1">
          <TrendingDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--color-success)]" />
          <span>Alacak</span>
        </div>
        <div className="text-base md:text-lg font-semibold text-[var(--color-success)]">
          {formatCurrency(summary.totalCredit)}
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-3 md:p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-xs md:text-sm mb-1">
          <Scale className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>Bakiye</span>
        </div>
        <div
          className={`text-base md:text-lg font-semibold ${
            summary.balance > 0
              ? "text-[var(--color-error)]"
              : summary.balance < 0
                ? "text-[var(--color-success)]"
                : "text-[var(--color-foreground)]"
          }`}
        >
          {formatCurrency(summary.balance)}
        </div>
      </div>
    </div>
  );
}
