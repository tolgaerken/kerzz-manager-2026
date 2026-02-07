import { DollarSign, Euro, RefreshCw } from "lucide-react";
import { useExchangeRates } from "../../hooks";

function formatRate(rate: number): string {
  return rate.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ExchangeRateDisplay() {
  const { rates, isLoading, error, refetch } = useExchangeRates();

  if (error) {
    return (
      <button
        onClick={() => void refetch()}
        className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500/20"
        title="Kurları yeniden yükle"
      >
        <RefreshCw className="h-3 w-3" />
        <span>Kur hatası</span>
      </button>
    );
  }

  if (isLoading || !rates) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5">
          <div className="h-3 w-3 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted-foreground/20" />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-surface-elevated px-3 py-1.5">
          <div className="h-3 w-3 animate-pulse rounded bg-muted-foreground/20" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted-foreground/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* USD */}
      <div
        className="flex items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-green-600 dark:text-green-400"
        title={`Ham kur: ${formatRate(rates.usd)} ₺ | %2.5 marjlı: ${formatRate(rates.usdWithMargin)} ₺`}
      >
        <DollarSign className="h-3.5 w-3.5" />
        <span className="text-sm font-medium">{formatRate(rates.usdWithMargin)}</span>
      </div>

      {/* EUR */}
      <div
        className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-3 py-1.5 text-blue-600 dark:text-blue-400"
        title={`Ham kur: ${formatRate(rates.eur)} ₺ | %2.5 marjlı: ${formatRate(rates.eurWithMargin)} ₺`}
      >
        <Euro className="h-3.5 w-3.5" />
        <span className="text-sm font-medium">{formatRate(rates.eurWithMargin)}</span>
      </div>
    </div>
  );
}
