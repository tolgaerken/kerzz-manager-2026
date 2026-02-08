import type { PipelineTotals } from "../../types/pipeline.types";

interface TotalsDisplayProps {
  totals: PipelineTotals | Record<string, any>;
  className?: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  tl: "₺",
  usd: "$",
  eur: "€",
};

function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency.toUpperCase();
  return `${symbol} ${amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function TotalsDisplay({ totals, className = "" }: TotalsDisplayProps) {
  const currencies = (totals as PipelineTotals)?.currencies || [];

  if (currencies.length === 0) {
    return (
      <div className={`text-sm text-[var(--color-foreground-muted)] ${className}`}>
        Henüz kalem eklenmemiş
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {currencies.map((ct) => (
        <div
          key={ct.currency}
          className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <div className="text-xs font-semibold text-[var(--color-foreground-muted)] uppercase mb-2">
            {ct.currency.toUpperCase()}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-foreground-muted)]">Ara Toplam</span>
              <span>{formatCurrency(ct.subTotal, ct.currency)}</span>
            </div>
            {ct.discountTotal > 0 && (
              <div className="flex justify-between text-red-500">
                <span>İndirim</span>
                <span>-{formatCurrency(ct.discountTotal, ct.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--color-foreground-muted)]">KDV</span>
              <span>{formatCurrency(ct.taxTotal, ct.currency)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-[var(--color-border)] pt-1">
              <span>Genel Toplam</span>
              <span>{formatCurrency(ct.grandTotal, ct.currency)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
