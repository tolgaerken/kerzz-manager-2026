interface ConversionRatesProps {
  leadToOfferRate: number;
  offerToSaleRate: number;
  overallConversionRate: number;
  isLoading?: boolean;
}

const RATE_CARDS = [
  {
    key: "leadToOfferRate",
    label: "Lead → Teklif",
    color: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
  },
  {
    key: "offerToSaleRate",
    label: "Teklif → Satış",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  },
  {
    key: "overallConversionRate",
    label: "Genel Dönüşüm",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
  },
] as const;

function formatPercent(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value);
}

export function ConversionRates({
  leadToOfferRate,
  offerToSaleRate,
  overallConversionRate,
  isLoading,
}: ConversionRatesProps) {
  const values = {
    leadToOfferRate,
    offerToSaleRate,
    overallConversionRate,
  } as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {RATE_CARDS.map((card) => (
        <div key={card.key} className="rounded-xl border border-border bg-surface p-5">
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${card.color}`}>
            {card.label}
          </div>
          <div className="mt-4 text-2xl font-semibold text-foreground">
            {isLoading ? "..." : `%${formatPercent(values[card.key])}`}
          </div>
          <p className="text-sm text-muted">Dönüşüm oranı</p>
        </div>
      ))}
    </div>
  );
}
