import type { LeadStats } from "../../leads";
import type { OfferStats } from "../../offers";
import type { SaleStats } from "../../sales";

interface FunnelChartProps {
  leads?: LeadStats;
  offers?: OfferStats;
  sales?: SaleStats;
  isLoading?: boolean;
}

const STAGES = [
  {
    key: "leads",
    label: "Lead",
    color: "bg-[var(--color-info)]/10 text-[var(--color-info)]",
    barColor: "bg-[var(--color-info)]/40",
  },
  {
    key: "offers",
    label: "Teklif",
    color: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    barColor: "bg-[var(--color-primary)]/40",
  },
  {
    key: "sales",
    label: "Satış",
    color: "bg-[var(--color-success)]/10 text-[var(--color-success)]",
    barColor: "bg-[var(--color-success)]/40",
  },
] as const;

export function FunnelChart({ leads, offers, sales, isLoading }: FunnelChartProps) {
  const leadTotal = leads?.total ?? 0;
  const offerTotal = offers?.total ?? 0;
  const saleTotal = sales?.total ?? 0;

  const stageValues = {
    leads: leadTotal,
    offers: offerTotal,
    sales: saleTotal,
  } as const;

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pipeline Funnel</h3>
          <p className="text-sm text-muted">Lead → Teklif → Satış akışı</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {STAGES.map((stage) => {
          const value = stageValues[stage.key];
          const ratio = leadTotal ? Math.min((value / leadTotal) * 100, 100) : 0;

          return (
            <div key={stage.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${stage.color}`}>
                  {stage.label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {isLoading ? "..." : value}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-elevated">
                <div
                  className={`h-2 rounded-full ${stage.barColor}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
