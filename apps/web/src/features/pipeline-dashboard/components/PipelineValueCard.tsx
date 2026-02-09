interface PipelineValueCardProps {
  value: number;
  weightedValue: number;
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PipelineValueCard({
  value,
  weightedValue,
  isLoading,
}: PipelineValueCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Açık Pipeline Değeri</h3>
          <p className="text-sm text-muted">Lead + teklif toplamı</p>
        </div>
        <span className="rounded-full bg-[var(--color-warning)]/10 px-3 py-1 text-xs font-medium text-[var(--color-warning)]">
          Tahmini
        </span>
      </div>
      <div className="mt-4 text-3xl font-bold text-foreground">
        {isLoading ? "..." : formatCurrency(value)}
      </div>
      <div className="mt-3 text-sm text-muted">
        Ağırlıklı:{" "}
        <span className="font-semibold text-foreground">
          {isLoading ? "..." : formatCurrency(weightedValue)}
        </span>
      </div>
    </div>
  );
}
