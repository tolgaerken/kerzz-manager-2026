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
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface-elevated)] rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 bg-[var(--color-border)] rounded w-20 mb-2" />
            <div className="h-6 bg-[var(--color-border)] rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-sm mb-1">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <span>Borç</span>
        </div>
        <div className="text-lg font-semibold text-red-500">
          {formatCurrency(summary.totalDebit)}
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-sm mb-1">
          <TrendingDown className="w-4 h-4 text-green-500" />
          <span>Alacak</span>
        </div>
        <div className="text-lg font-semibold text-green-500">
          {formatCurrency(summary.totalCredit)}
        </div>
      </div>

      <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 text-[var(--color-foreground-muted)] text-sm mb-1">
          <Scale className="w-4 h-4" />
          <span>Bakiye</span>
        </div>
        <div
          className={`text-lg font-semibold ${
            summary.balance > 0
              ? "text-red-500"
              : summary.balance < 0
                ? "text-green-500"
                : "text-[var(--color-foreground)]"
          }`}
        >
          {formatCurrency(summary.balance)}
        </div>
      </div>
    </div>
  );
}
