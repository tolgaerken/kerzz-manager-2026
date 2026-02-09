import type { LeadStats } from "../../leads";
import type { OfferStats } from "../../offers";
import type { SaleStats } from "../../sales";

export interface PipelineMetrics {
  leadToOfferRate: number;
  offerToSaleRate: number;
  overallConversionRate: number;
  pipelineValue: number;
  weightedPipelineValue: number;
}

export interface PipelineStatsData {
  leads?: LeadStats;
  offers?: OfferStats;
  sales?: SaleStats;
  metrics: PipelineMetrics;
}
